// src/app/components/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],  // ← Make sure NavbarComponent is here
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
}