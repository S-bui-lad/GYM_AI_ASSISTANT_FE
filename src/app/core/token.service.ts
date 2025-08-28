import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private TOKEN_KEY = 'token';
  private REFRESH_KEY = 'refresh';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private get storage(): Storage | null {
    try {
      const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
      const ls: Storage | undefined = g?.localStorage;
      return ls ?? null;
    } catch {
      return null;
    }
  }

  setToken(token: string) {
    const s = this.storage;
    if (!s) return;
    s.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    const s = this.storage;
    if (!s) return null;
    return s.getItem(this.TOKEN_KEY);
  }

  setRefreshToken(token: string) {
    const s = this.storage;
    if (!s) return;
    s.setItem(this.REFRESH_KEY, token);
  }
  getRefreshToken(): string | null {
    const s = this.storage;
    if (!s) return null;
    return s.getItem(this.REFRESH_KEY);
  }

  clear() {
    const s = this.storage;
    if (!s) return;
    s.removeItem(this.TOKEN_KEY);
    s.removeItem(this.REFRESH_KEY);
  }
}
