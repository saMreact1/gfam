import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckInResponse, CheckInService } from '../../../../core/services/check-in.service';

type CheckInState = 'idle' | 'success' | 'already-checked-in' | 'invalid';

interface BrowserBarcode {
  rawValue: string;
  format?: string;
}

interface BrowserBarcodeDetector {
  detect(source: CanvasImageSource): Promise<BrowserBarcode[]>;
}

interface BrowserBarcodeDetectorConstructor {
  new(options?: { formats?: string[] }): BrowserBarcodeDetector;
}

@Component({
  selector: 'app-check-in',
  standalone: false,
  templateUrl: './check-in.html',
  styleUrl: './check-in.scss'
})
export class CheckIn implements OnInit, OnDestroy {
  @ViewChild('cameraPreview') cameraPreview?: ElementRef<HTMLVideoElement>;

  enteredCode = '';
  scannedPayload = '';
  attendee: CheckInResponse | null = null;
  checkInState: CheckInState = 'idle';
  feedbackMessage = '';
  isLoading = false;
  isCameraActive = false;
  cameraError = '';
  eventError = '';
  isEventLoading = true;
  scannerSupported = this.hasBarcodeDetector();
  eventId: number | null = null;
  eventName = '72 Hours Registration 2026';

  private mediaStream: MediaStream | null = null;
  private barcodeDetector: BrowserBarcodeDetector | null = null;
  private scanFrameId: number | null = null;
  private scanErrorReported = false;

  constructor(
    private checkInService: CheckInService,
    private snack: MatSnackBar,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadEventContext();
  }

  async startCamera(): Promise<void> {
    if (!this.scannerSupported) {
      this.cameraError = 'Camera scanning is not supported by this browser. Enter the registration code manually.';
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError = 'Camera access is not available on this device.';
      return;
    }

    this.clearResult();
    this.cameraError = '';
    this.scannedPayload = '';

    try {
      const detector = this.getBarcodeDetector();
      if (!detector) {
        this.cameraError = 'Camera scanning is not supported by this browser. Enter the registration code manually.';
        return;
      }

      this.barcodeDetector = detector;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.isCameraActive = true;
      await this.attachStream();
      this.scanFrame();
    } catch (error) {
      this.stopCamera();
      this.cameraError = 'Unable to open the camera. Check browser permissions or enter the code manually.';
    }
  }

  stopCamera(): void {
    if (this.scanFrameId !== null) {
      cancelAnimationFrame(this.scanFrameId);
      this.scanFrameId = null;
    }

    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
    this.barcodeDetector = null;
    this.scanErrorReported = false;
    this.isCameraActive = false;

    const video = this.cameraPreview?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
  }

  submitManualCheckIn(): void {
    const code = this.extractRegistrationCode(this.enteredCode);
    if (!code) {
      this.snack.open('Please enter a registration code', 'Close', { duration: 3000 });
      return;
    }

    this.enteredCode = code;
    this.checkInByCode(code);
  }

  clearAll(): void {
    this.enteredCode = '';
    this.scannedPayload = '';
    this.cameraError = '';
    this.clearResult();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  get resultTitle(): string {
    switch (this.checkInState) {
      case 'success':
        return 'Checked In';
      case 'already-checked-in':
        return 'Already Checked In';
      case 'invalid':
        return 'Invalid Registration';
      default:
        return '';
    }
  }

  get resultIcon(): string {
    switch (this.checkInState) {
      case 'success':
        return 'check_circle';
      case 'already-checked-in':
        return 'info';
      case 'invalid':
        return 'cancel';
      default:
        return '';
    }
  }

  get resultMessage(): string {
    if (this.feedbackMessage) {
      return this.feedbackMessage;
    }

    if (this.checkInState === 'success') {
      return 'The attendee has been checked in successfully.';
    }

    if (this.checkInState === 'already-checked-in') {
      return 'This registration was previously checked in.';
    }

    if (this.checkInState === 'invalid') {
      return 'This code could not be checked in. Confirm the registration details and try again.';
    }

    return '';
  }

  get tagClass(): string {
    return this.attendee?.tagToIssue ? `tag-${this.attendee.tagToIssue.toLowerCase()}` : '';
  }

  private async attachStream(): Promise<void> {
    await Promise.resolve();
    const video = this.cameraPreview?.nativeElement;
    if (!video || !this.mediaStream) {
      throw new Error('Camera preview is not ready.');
    }

    video.srcObject = this.mediaStream;
    await video.play();
  }

  private async scanFrame(): Promise<void> {
    if (!this.isCameraActive || !this.barcodeDetector) {
      return;
    }

    const video = this.cameraPreview?.nativeElement;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      try {
        const detections = await this.barcodeDetector.detect(video);
        const rawValue = detections.find(detection => !!detection.rawValue)?.rawValue;

        if (rawValue) {
          this.zone.run(() => this.handleScannedPayload(rawValue));
          return;
        }
      } catch (error) {
        if (!this.scanErrorReported) {
          this.scanErrorReported = true;
          this.zone.run(() => {
            this.cameraError = 'Scanner could not read this frame. Keep the code steady in the camera view.';
          });
        }
      }
    }

    this.scanFrameId = requestAnimationFrame(() => this.scanFrame());
  }

  private handleScannedPayload(payload: string): void {
    const code = this.extractRegistrationCode(payload);
    this.scannedPayload = payload;
    this.enteredCode = code;
    this.stopCamera();

    if (!code) {
      this.checkInState = 'invalid';
      this.snack.open('No registration code found in the scan', 'Close', { duration: 3000 });
      return;
    }

    this.checkInByCode(code, payload);
  }

  private checkInByCode(code: string, barcode?: string): void {
    this.isLoading = true;
    this.clearResult();

    this.checkInService.scanRegistration({ code, barcode }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.attendee = response.data;

        if (response.responseCode === '00') {
          this.checkInState = 'success';
          this.feedbackMessage = response.message || 'The attendee has been checked in successfully.';
          this.snack.open(response.message || 'Attendee checked in successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          return;
        }

        if (response.responseCode === '05') {
          this.checkInState = 'already-checked-in';
          this.feedbackMessage = response.message || 'This registration was previously checked in.';
          this.snack.open(response.message || 'Attendee already checked in', 'Close', {
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
          return;
        }

        this.checkInState = 'invalid';
        this.feedbackMessage = response.message || 'This code could not be checked in.';
        this.snack.open(response.message || 'Invalid registration', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.attendee = err.error?.data || null;
        this.checkInState = 'invalid';
        this.feedbackMessage = err.error?.message || 'Unable to check in this registration.';
        this.snack.open(this.feedbackMessage, 'Close', { duration: 4000 });
      }
    });
  }

  private clearResult(): void {
    this.attendee = null;
    this.checkInState = 'idle';
    this.feedbackMessage = '';
  }

  private loadEventContext(): void {
    this.isEventLoading = true;
    this.eventError = '';

    this.checkInService.getCurrentEvent().subscribe({
      next: (event) => {
        this.eventId = event.eventId;
        this.eventName = event.eventName || this.eventName;
        this.isEventLoading = false;
      },
      error: () => {
        this.isEventLoading = false;
        this.eventError = 'Unable to load the 2026 event. Check your connection and try again.';
      }
    });
  }

  private extractRegistrationCode(payload: string): string {
    const trimmedPayload = payload.trim();
    if (!trimmedPayload) {
      return '';
    }

    const looksLikeUri = /^[a-z][a-z\d+\-.]*:/i.test(trimmedPayload) || trimmedPayload.includes('?');

    if (looksLikeUri) {
      try {
        const url = new URL(trimmedPayload, window.location.origin);
        const code = Array.from(url.searchParams.entries())
          .find(([parameter, value]) => {
            const normalizedParameter = parameter.toLowerCase();
            return ['code', 'registrationcode', 'barcode'].includes(normalizedParameter) && !!value.trim();
          })?.[1];

        if (code) {
          return code.trim().toUpperCase();
        }
      } catch (error) {
        return trimmedPayload.toUpperCase();
      }
    }

    return trimmedPayload.toUpperCase();
  }

  private hasBarcodeDetector(): boolean {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  }

  private getBarcodeDetector(): BrowserBarcodeDetector | null {
    const detectorConstructor = (window as Window & {
      BarcodeDetector?: BrowserBarcodeDetectorConstructor;
    }).BarcodeDetector;

    if (!detectorConstructor) {
      return null;
    }

    return new detectorConstructor({
      formats: [
        'qr_code',
        'code_128',
        'code_39',
        'ean_13',
        'ean_8',
        'upc_a',
        'upc_e',
        'itf',
        'codabar',
        'data_matrix',
        'pdf417'
      ]
    });
  }
}
