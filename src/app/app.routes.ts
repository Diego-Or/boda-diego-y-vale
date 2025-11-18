import { Routes } from '@angular/router';
import { headerComponent } from './shared/Nav/header';

export const routes: Routes = [
  {
    path: '**',
    redirectTo: '',
  },
];
