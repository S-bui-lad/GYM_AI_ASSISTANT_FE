import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-gyms-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class GymsListComponent implements OnInit {
  gyms: any[] = [];
  loading = false;

  constructor(private api: ApiService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getGyms().subscribe({
      next: (res) => (this.gyms = res || []),
      error: (err) => this.snack.open('Lỗi tải gym', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
  }

  goAdd() {
    this.router.navigate(['/gyms/add']);
  }

  viewEquipment(gym: any) {
    this.router.navigate([`/gyms/${gym._id}/equipment`]);
  }

  // Track by function for better performance
  trackByGymId(index: number, gym: any): string {
    return gym._id || index;
  }

  // Get active gyms count
  getActiveGyms(): number {
    return this.gyms.filter(gym => gym.status !== 'inactive').length;
  }

  // Get total equipment count (placeholder)
  getTotalEquipment(): number {
    // This would typically come from API, but for now we'll use a placeholder
    return this.gyms.length * 15; // Assuming average 15 equipment per gym
  }
}
