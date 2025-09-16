import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit, OnDestroy {
  targetDate = new Date('2025-10-08T05:00:00').getTime();
  countdown: any;
  timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  partners = [
    { src: '../../../assets/images/gfam-logo1.png', name: 'Partner 1' },
    { src: '../../../assets/images/gfam-hero.jpg', name: 'Partner 2' },
    { src: '../../../assets/images/gfam-hero.jpg', name: 'Partner 3' },
    { src: '../../../assets/images/gfam-logo1.png', name: 'Partner 4' },
  ];

  images = [
    { src: '../../../assets/images/Apostle_Tolu_Agboola.png', name: 'Ap. Tolu Agboola' },
    { src: '../../../assets/images/Baba_makin.png', name: 'Pastor Makin Olaosebikan' },
    { src: '../../../assets/images/Daddy_MF_Adeyemi.png', name: 'Evang M.F. Adeyemi' },
    { src: '../../../assets/images/Prophet_Ayo_Jeje.png', name: 'Pro. Ayo Jeje' },
    { src: '../../../assets/images/Prophet_Cherub_Obadare.png', name: 'Pro. Cherub Obadare' },
    { src: '../../../assets/images/Prophet_Jesse_Jangfa.png', name: 'Pro. Jesse Jangfa' },
    { src: '../../../assets/images/Pst_Segun_Michael.png', name: 'Pst. Segun Michael' },
    { src: '../../../assets/images/Pst_Sola_Ajewole.png', name: 'Pst. Sola Ajewole' },
    { src: '../../../assets/images/REV_AUSTIN.png', name: 'Rev. Austin Ukporhe' },
  ];
  currentImageIndex = 0;
  carouselInterval: any;

  ngOnInit(): void {
    this.updateCountdown();
    this.countdown = setInterval(() => this.updateCountdown(), 1000);
    this.carouselInterval = setInterval(() => this.nextImage(), 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdown);
    clearInterval(this.carouselInterval);
  }

  updateCountdown() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    this.timeLeft.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.timeLeft.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.timeLeft.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.timeLeft.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }
}
