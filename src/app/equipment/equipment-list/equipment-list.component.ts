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
}
