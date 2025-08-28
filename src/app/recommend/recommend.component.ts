import { Component, OnInit } from '@angular/core';
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
import { TokenService } from '../core/token.service';

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
export class RecommendComponent implements OnInit {
  recs: any[] = [];
  loading = false;
  gymId = '';
  userId = '';
  advice: any = null;
  planRecs: any[] = [];

  constructor(private api: ApiService, private snack: MatSnackBar, private tokenService: TokenService) {}

  ngOnInit(): void {
    const uid = this.tokenService.getUserId();
    if (uid) {
      this.userId = uid;
      // Auto-load recommendations for the logged-in user
      this.load();
      this.loadAdvice();
    }
  }

  load() {
    this.loading = true;
    const nextHandler = (res: any) => {
      const data = res?.recommendations || res?.data || res?.items || res;
      this.recs = Array.isArray(data) ? data : (data ? [data] : []);
    };

    const errorHandler = () => this.snack.open('Lỗi tải gợi ý', 'OK', { duration: 2000 });

    const completeHandler = () => (this.loading = false);

    if (this.userId) {
      this.api.getWorkoutRecommendationsByUser(this.userId).subscribe({
        next: nextHandler,
        error: errorHandler,
        complete: completeHandler
      });
    } else {
      this.api.getRecommendations(this.gymId || undefined).subscribe({
        next: nextHandler,
        error: errorHandler,
        complete: completeHandler
      });
    }
  }

  loadAdvice() {
    if (!this.userId) return;
    this.loading = true;
    this.api.getWorkoutAdviceByUser(this.userId).subscribe({
      next: (res) => {
        const normalized = this.normalizeAdvicePayload(res);
        this.advice = { advice: normalized };
        this.planRecs = this.buildRecsFromWeeklyPlan(
          this.advice?.advice?.plan?.weeklyPlan || [],
          this.advice
        );
      },
      error: () => this.snack.open('Lỗi tải tư vấn luyện tập', 'OK', { duration: 2000 }),
      complete: () => (this.loading = false)
    });
  }

  private buildRecsFromWeeklyPlan(weeklyPlan: any[], advice: any): any[] {
    const results: any[] = [];
    if (!Array.isArray(weeklyPlan)) return results;
    const goal: string | undefined = advice?.advice?.plan?.goal;
    const intensity: string | undefined = advice?.advice?.summary?.intensity;
    const progress: string | undefined = advice?.advice?.plan?.monitoring?.progress_tracking;
    const riskFirst: string | undefined = advice?.advice?.strengths_risks?.risks?.[0];
    for (const day of weeklyPlan) {
      const exercises = Array.isArray(day?.exercises) ? day.exercises : [];
      for (const ex of exercises) {
        const supportParts = [
          goal ? `Mục tiêu: ${goal}` : null,
          intensity ? `Cường độ: ${intensity}` : null,
          progress ? `Theo dõi: ${progress}` : null,
          riskFirst ? `Lưu ý: ${riskFirst}` : null
        ].filter(Boolean);
        results.push({
          name: ex?.equipment || 'Bài tập',
          sets: ex?.sets,
          reps: ex?.reps,
          duration_minutes: ex?.duration_minutes ?? this.parseDurationToMinutes(ex?.duration),
          day: day?.day,
          focus: day?.focus,
          category: 'Kế hoạch tuần',
          support: supportParts.join(' • ')
        });
      }
      // Cardio or activity day without exercises
      if (!exercises.length) {
        const duration = this.parseDurationToMinutes(day?.duration);
        const activities: string[] = Array.isArray(day?.activities) ? day.activities : [];
        if (activities.length) {
          for (const act of activities) {
            results.push({
              name: act,
              duration_minutes: duration,
              day: day?.day,
              focus: day?.focus,
              category: 'Kế hoạch tuần',
              support: [goal && `Mục tiêu: ${goal}`, intensity && `Cường độ: ${intensity}`].filter(Boolean).join(' • ')
            });
          }
        } else if (duration) {
          results.push({
            name: day?.focus || 'Cardio',
            duration_minutes: duration,
            day: day?.day,
            focus: day?.focus,
            category: 'Kế hoạch tuần',
            support: [goal && `Mục tiêu: ${goal}`, intensity && `Cường độ: ${intensity}`].filter(Boolean).join(' • ')
          });
        }
      }
    }
    return results;
  }

  getSupportTip(): string | null {
    if (!this.advice?.advice) return null;
    const parts = [
      this.advice.advice.summary?.intensity ? `Cường độ: ${this.advice.advice.summary.intensity}` : null,
      this.advice.advice.plan?.monitoring?.progress_tracking ? `Tiến độ: ${this.advice.advice.plan.monitoring.progress_tracking}` : null,
      this.advice.advice.plan?.monitoring?.injury_signs ? `Chấn thương: ${this.advice.advice.plan.monitoring.injury_signs}` : null
    ].filter(Boolean);
    return parts.length ? parts.join(' • ') : null;
  }

  getGoalDetails(): string[] {
    const details: string[] = [];
    const adv = this.advice?.advice;
    if (!adv) return details;
    const goal = adv.plan?.goal;
    const intensity = adv.summary?.intensity;
    const nutrition = adv.plan?.recovery?.nutrition;
    const sleep = adv.plan?.recovery?.sleep;
    const progress = adv.plan?.monitoring?.progress_tracking;
    const injury = adv.plan?.monitoring?.injury_signs;

    if (goal) details.push(goal);
    if (intensity) details.push(intensity);
    if (nutrition) details.push(`Dinh dưỡng: ${nutrition}`);
    if (sleep) details.push(`Giấc ngủ: ${sleep}`);
    if (progress) details.push(`Theo dõi: ${progress}`);
    if (injury) details.push(`Lưu ý: ${injury}`);
    return details;
  }

  private normalizeAdvicePayload(res: any): any {
    const raw = res?.advice ? res.advice : res;
    const summary = raw?.summary || {};
    const sr = raw?.strengths_risks || raw?.strengths_and_risks || {};
    const strengths = Array.isArray(sr?.strengths) ? sr.strengths : (sr?.strengths ? [sr.strengths] : []);
    const risks = Array.isArray(sr?.risks) ? sr.risks : (sr?.risks ? [sr.risks] : []);
    const planSrc = raw?.plan || raw?.plan_recommendation || {};
    const weeklyPlan = Array.isArray(planSrc?.weeklyPlan) ? planSrc.weeklyPlan : [];
    const normalizedWeekly = weeklyPlan.map((d: any) => {
      const exercises = Array.isArray(d?.exercises) ? d.exercises : [];
      // keep exercises; cardio/activities handled in build step
      return {
        day: d?.day || d?.Day || '',
        focus: d?.focus || '',
        exercises,
        duration: d?.duration,
        activities: d?.activities
      };
    });
    const recoverySrc = planSrc?.recovery || {};
    const monitoringSrc = planSrc?.monitoring || {};
    const recovery = {
      rest_days: recoverySrc?.rest_days ?? recoverySrc?.restDays ?? recoverySrc?.restdays ?? null,
      active_recovery: Array.isArray(recoverySrc?.active_recovery) ? recoverySrc.active_recovery : [],
      sleep: recoverySrc?.sleep ?? recoverySrc?.sleepHours ?? null,
      nutrition: recoverySrc?.nutrition ?? null
    };
    const monitoring = {
      progress_tracking: monitoringSrc?.progress_tracking ?? [monitoringSrc?.frequency, monitoringSrc?.adjustments].filter(Boolean).join(' · '),
      injury_signs: monitoringSrc?.injury_signs ?? (Array.isArray(monitoringSrc?.parameters) ? monitoringSrc.parameters.join(', ') : null)
    };
    return {
      summary: {
        trend: summary?.trend || null,
        intensity: summary?.intensity || null
      },
      strengths_risks: { strengths, risks },
      plan: {
        goal: planSrc?.goal || null,
        weeklyPlan: normalizedWeekly,
        recovery,
        monitoring
      }
    };
  }

  private parseDurationToMinutes(val: any): number | null {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const match = val.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return null;
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

  // Helpers to display fields safely
  getGymName(rec: any): string {
    return rec?.gym?.name || rec?.gymName || rec?.location || 'Không rõ phòng gym';
  }

  getExercises(rec: any): any[] {
    const items = rec?.items || rec?.exercises || rec?.workouts || [];
    return Array.isArray(items) ? items : [];
  }

  getExerciseName(item: any): string {
    return item?.name || item?.equipment?.name || item?.equipment || 'Bài tập';
  }

  getInstruction(src: any): string | null {
    return src?.instructions || src?.howTo || src?.guide || src?.description || null;
  }
}
