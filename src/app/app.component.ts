import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutNavbarComponent } from './layout/layout_navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule,LayoutNavbarComponent],
  standalone:true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'business_card';
}
