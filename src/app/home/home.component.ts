import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  services = [
    'Creation de dressing personnel',
    'Brief precis pour styliste',
    'Profil fashionista et profil styliste',
  ];
}
