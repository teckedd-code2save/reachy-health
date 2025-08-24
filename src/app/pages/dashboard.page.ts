import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
imports: [CommonModule],

  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css']
})
export class DashboardPage {
  @Input() healthStats: any;
  @Input() setView!: (view: string) => void;
}
