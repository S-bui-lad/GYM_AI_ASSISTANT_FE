import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-gym-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class GymAddComponent implements OnInit {
  form: any;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      openingHours: [''],
      description: ['']
    });
  }

  onSave() {
    if (this.form.invalid) return;
    this.loading = true;
    this.api.addGym(this.form.value).subscribe({
      next: (res) => {
        this.snack.open('Tạo phòng gym thành công! 🎉', 'OK', { duration: 3000 });
        this.router.navigate(['/gyms']);
      },
      error: (err) => {
        this.snack.open(err?.error?.message || 'Lỗi tạo phòng gym', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
