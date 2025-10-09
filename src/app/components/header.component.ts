import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() currentLang: any;
  @Input() isOffline: boolean = false;
  @Input() currentLanguage: string = 'english';
  @Input() setLanguage!: (event: Event) => void;
}
