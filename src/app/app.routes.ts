import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat';

export const routes: Routes = [
    { path: 'chat', component: ChatComponent },
    { path: '', redirectTo: 'chat', pathMatch: 'full' },
];
