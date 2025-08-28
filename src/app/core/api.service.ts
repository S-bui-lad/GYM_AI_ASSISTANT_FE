import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Auth
  register(data: any): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, data);
  }
  login(data: any): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, data);
  }

  // Gyms
  getGyms(): Observable<any> {
    return this.http.get(`${this.base}/gyms`);
  }
  addGym(data: any): Observable<any> {
    return this.http.post(`${this.base}/gyms`, data);
  }
  getGymById(id: string): Observable<any> {
    return this.http.get(`${this.base}/gyms/${id}`);
  }
  updateGym(id: string, data: any): Observable<any> {
    return this.http.put(`${this.base}/gyms/${id}` , data);
  }
  deleteGym(id: string): Observable<any> {
    return this.http.delete(`${this.base}/gyms/${id}`);
  }

  // Equipment
  getEquipmentByGym(gymId: string): Observable<any> {
    return this.http.get(`${this.base}/equipment/gyms/${gymId}`);
  }
  addEquipmentByImage(gymId: string, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('image', file, file.name);
    return this.http.post(`${this.base}/equipment/gyms/${gymId}/auto-add`, fd);
  }
  addEquipmentManual(gymId: string, payload: any): Observable<any> {
    return this.http.post(`${this.base}/equipment/gyms/${gymId}`, payload);
  }

  // Workouts
  addWorkout(payload: any): Observable<any> {
    return this.http.post(`${this.base}/workouts`, payload);
  }
  getMyWorkouts(): Observable<any> {
    return this.http.get(`${this.base}/workouts/me`);
  }
  getWorkoutById(id: string): Observable<any> {
    return this.http.get(`${this.base}/workouts/${id}`);
  }

  getWorkoutByIdWithGym(id: string): Observable<any> {
    const params = new HttpParams().set('populate', 'gym');
    return this.http.get(`${this.base}/workouts/${id}`, { params });
  }

  // Recommend
  getRecommendations(gymId?: string): Observable<any> {
    const params = gymId ? new HttpParams().set('gym', gymId) : undefined as any;
    return this.http.get(`${this.base}/recommend/me`, { params });
  }

  // Recommend by user id
  getWorkoutRecommendationsByUser(userId: string): Observable<any> {
    return this.http.get(`${this.base}/recommend/workouts/${userId}`);
  }

  // Advice by user id
  getWorkoutAdviceByUser(userId: string): Observable<any> {
    return this.http.get(`${this.base}/recommend/workouts/${userId}/advice`);
  }
}
