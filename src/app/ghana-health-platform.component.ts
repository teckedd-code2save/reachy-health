
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header.component';
import { DashboardPage } from './pages/dashboard.page';
import { DiagnosisPage } from './pages/diagnosis.page';

@Component({
  selector: 'app-ghana-health-platform',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, DashboardPage, DiagnosisPage],
  templateUrl: './ghana-health-platform.component.html',
  styleUrls: ['./ghana-health-platform.component.css']
})
export class GhanaHealthPlatformComponent {
  currentLanguage = 'english';
  isOffline = false;
  isListening = false;
  currentView = 'dashboard';
  patientData: any = {};
  voiceInput = '';

  languages: { [key: string]: {
    title: string;
    dashboard: string;
    patients: string;
    diagnosis: string;
    offline: string;
    online: string;
    voicePrompt: string;
    startListening: string;
    stopListening: string;
  }} = {
    english: {
      title: 'Reachy Health Assistant',
      dashboard: 'Dashboard',
      patients: 'Patients',
      diagnosis: 'Diagnosis Support',
      offline: 'Working Offline',
      online: 'Connected',
      voicePrompt: 'Describe the patient symptoms...',
      startListening: 'Start Voice Input',
      stopListening: 'Stop Voice Input'
    },
    twi: {
      title: 'Reachy Akwahosan Boafo',
      dashboard: 'Nsɛmpa Dan',
      patients: 'Ayarefoɔ',
      diagnosis: 'Nsunsuanso Mmoa',
      offline: 'Internet nni hɔ',
      online: 'Internet wɔ hɔ',
      voicePrompt: 'Ka ayarefoɔ nsɛnkyerɛnne...',
      startListening: 'Fi ase ka',
      stopListening: 'Gyae sɛ woka'
    },
    ga: {
      title: 'Reachy Lɛ Health Kpakpaa',
      dashboard: 'Kpakpaa Nɔɔ',
      patients: 'Ayɔɔlɛ Fee',
      diagnosis: 'Diagnosis Kpakpaa',
      offline: 'Internet ko oo',
      online: 'Internet wɔ',
      voicePrompt: 'Gbɛ ayɔɔlɛ symptoms...',
      startListening: 'Gbɛ fi ase',
      stopListening: 'Gbɛ k ɛ'
    }
  };

  healthStats = {
    totalPatients: 1247,
    todayConsultations: 34,
    pendingCases: 12,
    criticalAlerts: 3
  };

  constructor() {
    setInterval(() => {
      this.isOffline = Math.random() > 0.7;
    }, 5000);
  }

  get currentLang() {
    return this.languages[this.currentLanguage];
  }

  handleVoiceInput() {
    this.isListening = !this.isListening;
    if (this.isListening) {
      setTimeout(() => {
        this.voiceInput = 'Patient complains of fever, headache, and body aches for 3 days';
        this.isListening = false;
      }, 2000);
    }
  }

  getDiagnosticSuggestion(symptoms: string) {
    if (symptoms.toLowerCase().includes('fever') && symptoms.toLowerCase().includes('headache')) {
      return {
        condition: 'Possible Malaria',
        confidence: '78%',
        recommendations: [
          'Conduct rapid diagnostic test (RDT)',
          'Check for recent travel history',
          'Monitor temperature every 4 hours',
          'Ensure adequate fluid intake'
        ],
        urgency: 'medium'
      };
    }
    return null;
  }

  get diagnosticResult() {
    return this.voiceInput ? this.getDiagnosticSuggestion(this.voiceInput) : null;
  }

  setLanguage(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (select && select.value) {
      this.currentLanguage = select.value;
    }
  }

  setView(view: string) {
    this.currentView = view;
  }
}
