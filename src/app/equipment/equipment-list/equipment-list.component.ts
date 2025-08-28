import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.scss']
})
export class EquipmentListComponent implements OnInit {
  gymId!: string;
  items: any[] = [];
  loading = false;
  gymName = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.gymId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    if (!this.gymId) return;
    this.loading = true;
    this.api.getEquipmentByGym(this.gymId).subscribe({
      next: (res) => (this.items = res || []),
      error: () => this.snack.open('Lỗi tải thiết bị', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
  }

  goAdd() {
    this.router.navigate([`/gyms/${this.gymId}/equipment/add`]);
  }

  // Track by function for better performance
  trackByEquipmentId(index: number, item: any): string {
    return item._id || index;
  }

  // Get items with images count
  getItemsWithImages(): number {
    return this.items.filter(item => item.images && item.images.length > 0).length;
  }

  // Get unique categories count
  getUniqueCategories(): number {
    const categories = new Set(this.items.map(item => item.category).filter(Boolean));
    return categories.size;
  }

  // Validate image URL
  isValidImageUrl(url?: string): boolean {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Handle image load error
  onImageError(event: any, item: any) {
    console.warn(`Failed to load image for equipment: ${item.name}`, event);
    // You could set a flag here to show fallback UI
  }

  // Get image count for display
  getImageCount(item: any): number {
    return item.images?.length || 0;
  }

  // Check if item has valid images
  hasValidImages(item: any): boolean {
    return this.getImageCount(item) > 0 && this.isValidImageUrl(item.images[0]);
  }

  // Open image modal
  openImageModal(item: any) {
    if (this.hasValidImages(item)) {
      // For now, we'll just log the images
      // In a real app, you might want to use a modal service or dialog
      console.log('Equipment images:', item.images);
      console.log('Equipment name:', item.name);
      
      // You could implement a modal here using Angular Material Dialog
      // or a third-party lightbox library
      this.snack.open(`Xem ảnh: ${item.name} (${item.images.length} ảnh)`, 'OK', { duration: 2000 });
    }
  }
}
