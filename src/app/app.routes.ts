import { Routes } from '@angular/router';
import { CardConfigComponent } from './card-config/card-config.component';

export const routes: Routes = [
    {
        path: 'config',
        loadComponent: () => import('./card-config/card-config.component').then(m => m.CardConfigComponent)
    }
    
];
