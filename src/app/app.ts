import { Component } from '@angular/core';

import { GhanaHealthPlatformComponent } from './ghana-health-platform.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GhanaHealthPlatformComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'reachy';
}
