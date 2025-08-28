import { Component } from '@angular/core';
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
  selector: 'app-recommend',
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
  templateUrl: './recommend.component.html',
  styleUrls: ['./recommend.component.scss']
})
export class RecommendComponent {
  recs: any[] = [];
  loading = false;
  gymId = '';

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  load() {
    this.loading = true;
    this.api.getRecommendations(this.gymId || undefined).subscribe({
      next: (res) => (this.recs = res.recommendations || []),
      error: () => this.snack.open('Lỗi tải gợi ý', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
  }

  // Track by function for better performance
  trackByRecommendationId(index: number, rec: any): string {
    return rec._id || rec.name || index;
  }

  // Get unique categories count
  getUniqueCategories(): number {
    const categories = new Set(this.recs.map(rec => rec.category));
    return categories.size;
  }

  // Get unique brands count
  getUniqueBrands(): number {
    const brands = new Set(this.recs.map(rec => rec.brand));
    return brands.size;
  }

  // Get recommendation score (placeholder)
  getRecommendationScore(rec: any): number {
    // This would typically come from AI algorithm
    // For now, return a random score between 70-95
    return Math.floor(Math.random() * 26) + 70;
  }
}
