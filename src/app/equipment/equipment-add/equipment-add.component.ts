import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-equipment-add',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './equipment-add.component.html',
  styleUrls: ['./equipment-add.component.scss']
})
export class EquipmentAddComponent {
  gymId!: string;
  file?: File;
  imagePreview?: string;
  uploading = false;

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar, private router: Router) {
    this.gymId = this.route.snapshot.paramMap.get('id') || '';
  }

  onFile(event: any) {
    const f = event.target.files && event.target.files[0];
    if (f) {
      this.file = f;
      this.createImagePreview(f);
    }
  }

  createImagePreview(file: File) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onUpload() {
    if (!this.file || !this.gymId) {
      this.snack.open('Vui lòng chọn ảnh và đảm bảo gym hợp lệ', 'OK', { duration: 2000 });
      return;
    }

    // Validate file size (max 10MB)
    if (this.file.size > 10 * 1024 * 1024) {
      this.snack.open('Kích thước ảnh không được vượt quá 10MB', 'OK', { duration: 3000 });
      return;
    }

    // Validate file type
    if (!this.file.type.startsWith('image/')) {
      this.snack.open('Vui lòng chọn file ảnh hợp lệ', 'OK', { duration: 3000 });
      return;
    }

    this.uploading = true;
    this.api.addEquipmentByImage(this.gymId, this.file).subscribe({
      next: (res) => {
        this.snack.open('✅ Upload thành công! AI đã nhận diện và thêm thiết bị vào hệ thống', 'OK', { duration: 3000 });
        this.router.navigate([`/gyms/${this.gymId}/equipment`]);
      },
      error: (err) => {
        console.error('Upload error:', err);
        let errorMessage = 'Upload thất bại';
        
        if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.status === 413) {
          errorMessage = 'File quá lớn, vui lòng chọn ảnh nhỏ hơn';
        } else if (err?.status === 400) {
          errorMessage = 'Định dạng ảnh không hợp lệ';
        } else if (err?.status === 500) {
          errorMessage = 'Lỗi server, vui lòng thử lại sau';
        }
        
        this.snack.open(errorMessage, 'OK', { duration: 4000 });
        this.uploading = false;
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  clearFile() {
    this.file = undefined;
    this.imagePreview = undefined;
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
