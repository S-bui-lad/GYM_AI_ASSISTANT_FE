import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
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
    MatSnackBarModule
  ],
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.scss']
})
export class WorkoutsComponent implements OnInit {
  workouts: any[] = [];
  loading = false;
  showQuickAdd = false;

  // quick create
  form: any = { gym: '', items: [{ equipment: '', sets: 3, reps: 10 }] };

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getMyWorkouts().subscribe({
      next: (res) => (this.workouts = res || []),
      error: () => this.snack.open('Lỗi tải lịch sử', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
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
