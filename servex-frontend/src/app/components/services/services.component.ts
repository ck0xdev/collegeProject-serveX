// src/app/components/services/services.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

interface ServicePlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  plans: ServicePlan[] = [
    {
      name: 'Starter',
      price: '$999',
      description: 'Perfect for personal portfolios',
      features: [
        '3 Page Website',
        'Responsive Design',
        'Contact Form',
        '1 Week Delivery'
      ]
    },
    {
      name: 'Business',
      price: '$2,499',
      description: 'For startups and small teams',
      features: [
        '8 Page Website',
        'CMS Integration (Admin Panel)',
        'Basic SEO Setup',
        '2 Weeks Delivery'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Complex web applications',
      features: [
        'Full-Stack App (React/Node)',
        'User Authentication',
        'Database Integration',
        'Priority Support'
      ]
    }
  ];
}