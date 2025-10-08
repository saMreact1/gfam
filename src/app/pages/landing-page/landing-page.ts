import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit, OnDestroy {
  // Program start date - Set to today at midnight
  programStartDate: number;
  dayCheckInterval: any;
  currentDay = 1;

  constructor() {
    // Set program start to today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.programStartDate = today.getTime();
  }

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
    this.updateCurrentDay();
    // Check every minute to update the day
    this.dayCheckInterval = setInterval(() => this.updateCurrentDay(), 60000);
    this.carouselInterval = setInterval(() => this.nextImage(), 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.dayCheckInterval);
    clearInterval(this.carouselInterval);
  }

  updateCurrentDay() {
    const now = new Date().getTime();
    const timeSinceStart = now - this.programStartDate;

    // Calculate which day we're on (1-indexed)
    // Each day is 24 hours = 86400000 milliseconds
    const daysPassed = Math.floor(timeSinceStart / (1000 * 60 * 60 * 24));

    // Day 1 starts at 0 days passed, Day 2 at 1 day passed, etc.
    this.currentDay = daysPassed + 1;

    // Cap at Day 3 (72 hours = 3 days)
    if (this.currentDay > 3) {
      this.currentDay = 3;
    }

    // If program hasn't started yet, show Day 1
    if (this.currentDay < 1) {
      this.currentDay = 1;
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }
}
