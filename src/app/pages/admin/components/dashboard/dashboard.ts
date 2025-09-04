import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  displayedColumns: string[] = ['name', 'role', 'city'];
  attendees = [
    { firstName: 'John', lastName: 'Doe', role: 'Pastor', city: 'Lagos' },
    { firstName: 'Mary', lastName: 'Smith', role: 'Minister', city: 'Abuja' },
    { firstName: 'James', lastName: 'Brown', role: 'Prophet', city: 'Port Harcourt' }
  ];

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [5, 12, 18, 25, 40, 30, 50],
        label: 'Registrations',
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25,118,210,0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1976d2'
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio : false,
    plugins: {
      legend: { display: false }
    }
  };

  // Pie Chart
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Pastor', 'Minister', 'Prophet', 'Member'],
    datasets: [
      {
        data: [45, 30, 20, 25],
        backgroundColor: ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2']
      }
    ]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio : false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };
}