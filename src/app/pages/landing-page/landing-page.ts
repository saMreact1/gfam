import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit, OnDestroy {
  programStartDate = new Date('2026-10-07T00:00:00').getTime();
  programEndDate = new Date('2026-10-10T23:59:59').getTime();
  dayCheckInterval: any;
  countdownInterval: any;
  currentDay = 1;
  programStarted = false;
  programEnded = false;
  isScrolled = false;

  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  speakers = [
    { title: 'HOST', name: 'Prophet Abraham Adebayo', image: '../../../assets/images/slide10.jpg' },
    { title: 'Reverend', name: 'Austin Ukporhe', image: '../../../assets/images/REV_AUSTIN.png' },
    { title: 'Prophet', name: 'Ayo Jeje', image: '../../../assets/images/Prophet_Ayo_Jeje.png' },
    { title: 'Evangelist', name: 'M.F Adeyemi', image: '../../../assets/images/Daddy_MF_Adeyemi.png' },
    { title: 'Pastor', name: 'Makin Olaosebikan', image: '../../../assets/images/Baba_makin.png' },
    { title: 'Pastor', name: 'Shola Ajewole', image: '../../../assets/images/Pst_Sola_Ajewole.png' },
    { title: 'Prophet', name: 'Cherub Obadare', image: '../../../assets/images/Prophet_Cherub_Obadare.png' },
    { title: 'Apostle', name: 'Tolu Agboola', image: '../../../assets/images/Apostle_Tolu_Agboola.png' },
    { title: 'Pastor', name: 'Segun Michael', image: '../../../assets/images/Pst_Segun_Michael.png' },
  ];

  ngOnInit(): void {
    this.updateStatus();
    this.dayCheckInterval = setInterval(() => this.updateStatus(), 60000);
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
    this.updateCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.dayCheckInterval);
    clearInterval(this.countdownInterval);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  updateStatus() {
    const now = Date.now();

    if (now < this.programStartDate) {
      this.programStarted = false;
      this.programEnded = false;
    } else if (now >= this.programStartDate && now <= this.programEndDate) {
      this.programStarted = true;
      this.programEnded = false;
      const daysPassed = Math.floor((now - this.programStartDate) / (1000 * 60 * 60 * 24));
      this.currentDay = Math.min(daysPassed + 1, 3);
    } else {
      this.programStarted = false;
      this.programEnded = true;
    }
  }

  updateCountdown() {
    const now = Date.now();
    const diff = this.programStartDate - now;

    if (diff <= 0) {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      this.updateStatus();
      return;
    }

    this.countdown = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }
}
