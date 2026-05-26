import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface StyleDemand {
  occasion: string;
  deadline: string;
  budget: string;
  morphology: string;
  colors: string;
  avoid: string;
  notes: string;
}

@Component({
  selector: 'app-demand',
  imports: [FormsModule],
  templateUrl: './demand.component.html',
  styleUrl: './demand.component.css'
})
export class DemandComponent {
  demand: StyleDemand = {
    occasion: '',
    deadline: '',
    budget: '',
    morphology: '',
    colors: '',
    avoid: '',
    notes: '',
  };

  sentDemands: StyleDemand[] = [];

  submitDemand(): void {
    if (!this.demand.occasion.trim()) {
      return;
    }

    this.sentDemands = [{ ...this.demand }, ...this.sentDemands];
    this.demand = {
      occasion: '',
      deadline: '',
      budget: '',
      morphology: '',
      colors: '',
      avoid: '',
      notes: '',
    };
  }
}
