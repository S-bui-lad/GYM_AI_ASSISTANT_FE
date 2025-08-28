import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-gyms-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class GymsListComponent implements OnInit {
  gyms: any[] = [];
  loading = false;
  selectedGym: any = null;
  editLoading = false;
  @ViewChild('gymEditTpl') gymEditTpl: any;

  constructor(private api: ApiService, private router: Router, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }
  openEdit(gym: any) {
    if (!gym?._id) return;
    this.editLoading = true;
    this.api.getGymById(gym._id).subscribe({
      next: (res) => {
        // Support both wrapped and plain responses
        this.selectedGym = (res && (res.data || res.item)) ? (res.data || res.item) : res;
        this.editLoading = false;
        this.dialog.open(this.gymEditTpl, { width: '560px' });
      },
      error: () => {
        this.editLoading = false;
        this.snack.open('Lỗi tải thông tin gym', 'OK', { duration: 2000 });
      }
    });
  }

  saveEdit() {
    if (!this.selectedGym?._id) return;
    const {_id, name, address} = this.selectedGym;
    // Ensure payload matches backend expectations
    const payload: any = { name, address };
    this.api.updateGym(_id, payload).subscribe({
      next: () => {
        this.snack.open('Cập nhật gym thành công', 'OK', { duration: 1500 });
        this.dialog.closeAll();
        this.load();
      },
      error: () => this.snack.open('Lỗi cập nhật gym', 'OK', { duration: 2000 })
    });
  }

  closeEdit() {
    this.dialog.closeAll();
  }

  deleteGym(gym: any) {
    if (!gym?._id) return;
    this.api.deleteGym(gym._id).subscribe({
      next: () => {
        this.snack.open('Đã xóa gym', 'OK', { duration: 1500 });
        this.load();
      },
      error: () => this.snack.open('Lỗi xóa gym', 'OK', { duration: 2000 })
    });
  }

  load() {
    this.loading = true;
    this.api.getGyms().subscribe({
      next: (res) => {
        // Support both array response and wrapped object response
        this.gyms = Array.isArray(res) ? res : (res?.data || res?.items || []);
      },
      error: (err) => this.snack.open('Lỗi tải gym', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
  }

  goBack(){
    this.router.navigate(['/dashboard']);
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
