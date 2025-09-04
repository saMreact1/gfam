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
  timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

  images = [
    '../../../assets/images/gfam-hero.jpg',
    '../../../assets/images/slide.jpg',
    '../../../assets/images/slide0.jpg',
    '../../../assets/images/slide1.jpg',
    '../../../assets/images/slide2.jpg',
    '../../../assets/images/slide3.jpg',
    '../../../assets/images/slide4.jpg',
    '../../../assets/images/slide5.jpg',
    '../../../assets/images/slide6.jpg',
    '../../../assets/images/slide7.jpg',
    '../../../assets/images/slide8.jpg',
    '../../../assets/images/slide9.jpg',
    '../../../assets/images/slide10.jpg',
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
