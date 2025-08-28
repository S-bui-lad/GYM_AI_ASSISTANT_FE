import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.scss']
})
export class WorkoutsComponent implements OnInit {
  workouts: any[] = [];
  loading = false;
  showQuickAdd = false;
  gyms: any[] = [];
  equipment: any[] = [];
  selectedWorkout: any = null;
  detailLoading = false;
  @ViewChild('workoutDetailTpl') workoutDetailTpl: any;

  // quick create
  form: any = { gym: '', items: [{ equipment: '', sets: 3, reps: 10 }] };

  constructor(private api: ApiService, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
    this.loadGyms();
  }

  load() {
    this.loading = true;
    this.api.getMyWorkouts().subscribe({
      next: (res) => (this.workouts = Array.isArray(res) ? res : (res?.data || res?.items || [])),
      error: () => this.snack.open('Lỗi tải lịch sử', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
  }

  loadGyms() {
    this.api.getGyms().subscribe({
      next: (res) => (this.gyms = Array.isArray(res) ? res : []),
      error: () => this.snack.open('Lỗi tải danh sách phòng gym', 'OK', { duration: 2000 })
    });
  }

  onGymChange(gymId: string) {
    this.form.items[0].equipment = '';
    if (!gymId) {
      this.equipment = [];
      return;
    }
    this.api.getEquipmentByGym(gymId).subscribe({
      next: (res) => (this.equipment = Array.isArray(res) ? res : []),
      error: () => this.snack.open('Lỗi tải thiết bị của phòng gym', 'OK', { duration: 2000 })
    });
  }

  openDetail(id: string) {
    if (!id) return;
    this.detailLoading = true;
    this.api.getWorkoutById(id).subscribe({
      next: (res) => {
        const data = (res && (res.data || res.item)) ? (res.data || res.item) : res;
        this.selectedWorkout = data;
        this.detailLoading = false;
        this.dialog.open(this.workoutDetailTpl, { width: '640px', maxHeight: '80vh', autoFocus: false });

        // If gym is returned as an ID string, fetch full gym info for display
        if (data && typeof data.gym === 'string' && data.gym) {
          this.api.getGymById(data.gym).subscribe((g) => {
            const gymData = (g && (g.data || g.item)) ? (g.data || g.item) : g;
            this.selectedWorkout = { ...this.selectedWorkout, gym: gymData };
          });
        }

        // If gym is null, try fetching again with populate param
        if (!data?.gym) {
          this.api.getWorkoutByIdWithGym(id).subscribe((res2) => {
            const data2 = (res2 && (res2.data || res2.item)) ? (res2.data || res2.item) : res2;
            if (data2?.gym) {
              this.selectedWorkout = { ...data2 };
            }
          });
        }
      },
      error: () => {
        this.detailLoading = false;
        this.snack.open('Lỗi tải chi tiết buổi tập', 'OK', { duration: 2000 });
      }
    });
  }

  closeDetail() {
    this.dialog.closeAll();
  }

  create() {
    if (!this.form.gym) {
      this.snack.open('Chọn gym', 'OK', { duration: 1500 });
      return;
    }
    this.api.addWorkout(this.form).subscribe({
      next: () => {
        this.snack.open('Đã lưu buổi tập', 'OK', { duration: 1500 });
        this.load();
        this.showQuickAdd = false; // Hide form after successful save
      },
      error: () => this.snack.open('Lỗi lưu', 'OK', { duration: 2000 })
    });
  }

  // Track by function for better performance
  trackByWorkoutId(index: number, workout: any): string {
    return workout._id || index;
  }

  // Get total exercises count
  getTotalExercises(): number {
    return this.workouts.reduce((total, workout) => {
      return total + (workout.items?.length || 0);
    }, 0);
  }

  // Get total sets count
  getTotalSets(): number {
    return this.workouts.reduce((total, workout) => {
      return total + (workout.items?.reduce((itemTotal: number, item: any) => {
        return itemTotal + (item.sets || 0);
      }, 0) || 0);
    }, 0);
  }
}
