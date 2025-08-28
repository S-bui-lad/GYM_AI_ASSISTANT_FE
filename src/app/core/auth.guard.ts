import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';

export const AuthGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  const token = tokenService.getToken();
  if (!token) {
    return router.createUrlTree(['/login']);
  }
  return true;
};
