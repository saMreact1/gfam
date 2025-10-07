import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  collapsed: boolean = false;
  isMobile: boolean = false;
  isAdmin: boolean = false;

  ngOnInit() {
    this.checkScreenSize();
    const user = localStorage.getItem('adminUser');
    if (user) {
      const userData = JSON.parse(user);
      this.isAdmin = userData.role === 'ADMIN';
    }
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    this.collapsed = this.isMobile ? true : false;
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed
  }

  onNavClick() {
    if(this.isMobile) {
      this.collapsed = true;
    }
  }
}
