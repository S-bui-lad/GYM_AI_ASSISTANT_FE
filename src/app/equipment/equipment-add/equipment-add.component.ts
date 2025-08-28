import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatSnackBarModule
  ],
  templateUrl: './equipment-add.component.html'
})
export class EquipmentAddComponent {
  gymId!: string;
  file?: File;
  uploading = false;

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar, private router: Router) {
    this.gymId = this.route.snapshot.paramMap.get('id') || '';
  }

  onFile(event: any) {
    const f = event.target.files && event.target.files[0];
    if (f) this.file = f;
  }

  onUpload() {
    if (!this.file || !this.gymId) {
      this.snack.open('Vui lòng chọn ảnh và đảm bảo gym hợp lệ', 'OK', { duration: 2000 });
      return;
    }
    this.uploading = true;
    this.api.addEquipmentByImage(this.gymId, this.file).subscribe({
      next: (res) => {
        this.snack.open('Upload & AI done', 'OK', { duration: 2000 });
        console.log(res);
        this.router.navigate([`/gyms/${this.gymId}/equipment`]);
      },
      error: (err) => {
        console.error(err);
        this.snack.open(err?.error?.message || 'Upload failed', 'OK', { duration: 3000 });
        this.uploading = false;
      }
    });
  }
}
