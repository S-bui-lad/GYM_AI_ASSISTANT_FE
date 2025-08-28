import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  form: any;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private snack: MatSnackBar, private router: Router) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['MEMBER', Validators.required] // MEMBER or MANAGER
    });
  }

  onRegister() {
    if (this.form.invalid) return;
    this.loading = true;
    this.api.register(this.form.value).subscribe({
      next: () => {
        this.snack.open('Đăng ký thành công. Hãy đăng nhập.', 'OK', { duration: 2500 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.snack.open(err?.error?.message || 'Register failed', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
