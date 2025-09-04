import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  collapsed: boolean = false;

  ngOnInit() {
    this.collapsed = window.innerWidth <= 768;
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed
  }
}
