import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { DashboardService, DashboardStatsResponse } from '../../../../core/services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  isLoading = false;
  eventId = 1;

  // Stats
  totalRegistered = 0;
  attended = 0;
  pending = 0;
  virtual = 0;

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Registrations',
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Pie Chart
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe',
          '#43e97b',
          '#fa709a'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.updateDashboardData(response.data);
        } else {
          this.snack.open(response.message || 'Failed to load dashboard stats', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open('Failed to load dashboard stats. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  updateDashboardData(stats: DashboardStatsResponse) {
    console.log('📊 Dashboard stats received:', stats);
    // Update stats
    this.totalRegistered = stats.totalRegistered || 0;
    this.attended = stats.attended || 0;
    this.pending = stats.pending || 0;
    this.virtual = stats.virtual || 0;
    console.log('📊 Updated values:', {
      totalRegistered: this.totalRegistered,
      attended: this.attended,
      pending: this.pending,
      virtual: this.virtual
    });

    // Update line chart (Registrations Over Time)
    const timeLabels = Object.keys(stats.registrationsOverTime);
    const timeData = Object.values(stats.registrationsOverTime) as number[];
    this.lineChartData = {
      labels: timeLabels,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: timeData
        }
      ]
    };

    // Update pie chart (Attendees by Role)
    const roleLabels = Object.keys(stats.attendeesByRole);
    const roleData = Object.values(stats.attendeesByRole) as number[];
    this.pieChartData = {
      labels: roleLabels,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: roleData
        }
      ]
    };
  }

  refreshDashboard() {
    this.loadDashboardStats();
  }
}
