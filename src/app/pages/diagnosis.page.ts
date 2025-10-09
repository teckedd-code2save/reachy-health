import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-diagnosis-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnosis.page.html',
  styleUrls: ['./diagnosis.page.css'],
})
export class DiagnosisPage {
  @Input() currentLang: any;
  @Input() isListening: boolean = false;
  @Input() voiceInput: string = '';
  @Input() handleVoiceInput!: () => void;
  @Input() diagnosticResult: any;
}
