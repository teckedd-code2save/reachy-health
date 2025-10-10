import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { PatientService } from '../services/patient.service';
import { VisitService } from '../services/visit.service';
import { CaseService } from '../services/case.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  providers: [PatientService, VisitService, CaseService, AlertService],
})
export class DashboardPage implements OnInit {
  private patientService = inject(PatientService);
  private visitService = inject(VisitService);
  private caseService = inject(CaseService);
  private alertService = inject(AlertService);

  @Input() healthStats = {
    totalPatients: 0,
    todayConsultations: 0,
    pendingCases: 0,
    criticalAlerts: 0,
  };
  @Input() setView!: (view: string) => void;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe((patients) => {
      this.healthStats.totalPatients = patients.length;
    });
    this.visitService.getVisits().subscribe((visits) => {
      // Example: count today's visits
      const today = new Date().toISOString().slice(0, 10);
      this.healthStats.todayConsultations = visits.filter(
        (v: any) => v.visit_date?.slice(0, 10) === today,
      ).length;
    });
    this.caseService.getCases().subscribe((cases) => {
      this.healthStats.pendingCases = cases.filter(
        (c: any) => c.status === 'pending',
      ).length;
    });
    this.alertService.getAlerts().subscribe((alerts) => {
      this.healthStats.criticalAlerts = alerts.filter(
        (a: any) => a.severity === 'critical',
      ).length;
    });
  }
}
