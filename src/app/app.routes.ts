import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GymsListComponent } from './gyms/list/list.component';
import { GymAddComponent } from './gyms/add/add.component';
import { EquipmentListComponent } from './equipment/equipment-list/equipment-list.component';
import { EquipmentAddComponent } from './equipment/equipment-add/equipment-add.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { RecommendComponent } from './recommend/recommend.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'gyms', 
    component: GymsListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'gyms/add', 
    component: GymAddComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'gyms/:id/equipment', 
    component: EquipmentListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'gyms/:id/equipment/add', 
    component: EquipmentAddComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'workouts', 
    component: WorkoutsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'recommend', 
    component: RecommendComponent,
    canActivate: [AuthGuard]
  }
];
