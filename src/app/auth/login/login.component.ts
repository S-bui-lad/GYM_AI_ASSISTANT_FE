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
import { TokenService } from '../../core/token.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: any;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private token: TokenService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin() {
    if (this.form.invalid) return;
    this.loading = true;
    this.api.login(this.form.value).subscribe({
      next: (res) => {
        this.token.setToken(res.accessToken);
        if (res.refreshToken) this.token.setRefreshToken(res.refreshToken);
        this.snack.open('Đăng nhập thành công', 'OK', { duration: 2000 });
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.snack.open(err?.error?.message || 'Login failed', 'OK', { duration: 3000 });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
