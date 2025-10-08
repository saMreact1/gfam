import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

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
  userName: string = '';
  userEmail: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();
    const user = localStorage.getItem('adminUser');
    if (user) {
      const userData = JSON.parse(user);
      this.isAdmin = userData.role === 'ADMIN';
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userEmail = userData.email;
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

  logout() {
    localStorage.clear();
    this.router.navigate(['/admin/login']);
  }
}
