import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScoreModel } from 'src/app/models/ScoreModel';
import { AuthService } from 'src/app/services/auth.service';
import { ReportsService } from 'src/app/services/reports.service';
import { Report } from 'src/app/entities/Report';
import { ChatService } from 'src/app/services/chat.service';
import { firstValueFrom } from 'rxjs';
import { ChatResponse } from 'src/app/models/ChatResponse';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss']
})
export class ScoresComponent {
  //scores: any = null;
  //diseases: any = null;
  isLoading: boolean = true;
  chatIsLoading: boolean = false;
  hasReports: boolean = true;
  userReports: any[] = [];
  mostRecentReport: Report = new Report();
  scoreModel: ScoreModel = new ScoreModel();
  reportId = this.route.snapshot.queryParamMap.get('id');
  userId = localStorage.getItem('userId')!;
  extractedData: any = null;
  //userMessage = 'Give me the health risks you can calculate based on my report. Give me just the health risks, like the diseases you can calculate the risk no other text.';
  response = '';
  riskItems: { name: string; level: string; response?: string; isOpen?: boolean }[] = [];
  //showResponse: boolean = false;
  medicalContext: string = '';

  constructor(
    private reportService: ReportsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      this.reportService.getReportsByUserId(+this.userId).subscribe(async response => {
        this.userReports = response;
        if(this.userReports.length === 0) {
          this.hasReports = false;
          this.isLoading = false;
          return;
        }
        this.hasReports = true;
        if(!this.reportId) {
          this.reportId = await this.getLatestReportId(+localStorage.getItem('userId')!);
        }       
        this.scoreModel.reportId = this.reportId;
        await this.getUserDetails(+this.userId);
        await this.getReportData(this.reportId);
        await this.getScores();
        await this.getRiskItems();
        this.isLoading = false;
      });
    } 
    catch (error) {
      console.error('Error in initialization:', error);
      this.isLoading = false;
    }
  }
  async getUserDetails(id: number): Promise<void> {
    try {
      this.isLoading = true;
      const response = await firstValueFrom(this.authService.getUser(id));
      this.scoreModel.userDetails = response.userDetails;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }
  async getScores(): Promise<void> {
    try {
      const patientInfo = {
        age: this.scoreModel.userDetails.age,
        gender: this.scoreModel.userDetails.gender,
        weight: this.scoreModel.userDetails.weight,
        height: this.scoreModel.userDetails.height,
        arterialTension: this.scoreModel.userDetails.arterialTension,
        waistCircumference: this.scoreModel.userDetails.waistCircumference,
        smoking: this.scoreModel.userDetails.smoking,
        diabetes: this.scoreModel.userDetails.diabetes,
        alcoholConsumption: this.scoreModel.userDetails.alcoholConsumption,
        physicalActivityLevel: this.scoreModel.userDetails.physicalActivityLevel,
        hypertension: this.scoreModel.userDetails.hypertension,
        autoimmuneDiseases: this.scoreModel.userDetails.autoimmuneDiseases,
        allergies: this.scoreModel.userDetails.allergies,
      };
      const medicalContext = {
        analyses: this.extractedData?.map((d: any) => ({
          test: d.Test,
          result: d.Rezultat,
          um: d.UM,
          interval: d['Interval de referinta']
        })) || [],
      };

      this.medicalContext = `
        Informatii Pacient:
        - Varsta: ${patientInfo.age}
        - Gen: ${patientInfo.gender}
        - Greutate: ${patientInfo.weight} kg
        - Inaltime: ${patientInfo.height} cm
        - Circumferința Taliei: ${patientInfo.waistCircumference} cm
        - Tensiunea Arterială: ${patientInfo.arterialTension}
        - Consum de Alcool: ${patientInfo.alcoholConsumption}
        - Nivel de Activitate Fizică: ${patientInfo.physicalActivityLevel}
        - Fumator: ${patientInfo.smoking}
        - Diabet: ${patientInfo.diabetes}
        - Hipertensiune arterială: ${patientInfo.hypertension}
        - Boli autoimune: ${patientInfo.autoimmuneDiseases}
        - Alergii: ${patientInfo.allergies}

        Analiza Medicala:
        ${medicalContext.analyses.map((d: any) => `
        Test: ${d.test}
        Rezultat: ${d.result}
        UM: ${d.um}
        Interval de referinta: ${d.interval}
        `).join('\n')}
      `;
    } catch (error) {
      console.error('Error getting scores:', error);
      throw error;
    }
  }
  async getReportData(documentId: string | null): Promise<any> {
    try {
      const response = await firstValueFrom(this.reportService.getReportData(documentId));
      this.extractedData = response.data.extractedData;
    } catch (error) {
      console.error('Error getting report data:', error);
      throw error;
    }
  }
  async getRiskItems(): Promise<void> {
    var m = `Intrebare User: Pe baza rezultatelor analizelor medicale, afișează o listă cu 
      exact 9 boli sau afecțiuni și nivelul de risc asociat fiecăreia. 
      Formatul răspunsului să fie: 'Nume boală: Nivel risc'. 
      Folosește niveluri de risc exprimate în cuvinte (ex. risc scăzut, moderat, ridicat). 
      Nu adăuga alte detalii, texte sau caractere.`
    try {
      const message = `${this.medicalContext}\n\n ${m}`;
      const res = await firstValueFrom(this.chatService.sendMessage(message)) as ChatResponse;
      this.response = res.choices[0].message.content;
      this.parseRiskItems();
    } catch (error) {
      console.error('Error getting risk items:', error);
      throw error;
    }
  }
  async onRiskItemClick(riskItem: { name: string; level: string; response?: string; isOpen?: boolean } | null): Promise<void> {
    if (!riskItem) {
      // Close all cards
      this.riskItems.forEach(risk => {
        risk.isOpen = false;
      });
      return;
    }
    this.chatIsLoading = true;
    // Close all other cards first
    this.riskItems.forEach(risk => {
      if (risk !== riskItem) {
        risk.isOpen = false;
      }
    });
    
    // Toggle the clicked card
    riskItem.isOpen = !riskItem.isOpen;
    
    try {
      if (riskItem.isOpen && !riskItem.response) {
        let m = `Intrebare User: Vreau sa stiu care este riscul sa dezvolt ${riskItem.name}. 
        Descrierea sa fie simpla si scurta. Maxim 50-100 cuvinte, ofera justificare pe baza rezultatelor date. 
        Descrierea sa fie astfel: Riscul de a dezvolta ${riskItem.name} este 'nivelul de risc al acesteia'
        deoarece  'justificarea' Foloseste ${riskItem.level}. Nu folosi caractere speciale.
        Evita sa folosesti cuvantul risc si apoi nivelul riscului. Nu suna bine.
        Asa da "Riscul de a dezolta Anemia este scazut deoarece...", 
        Asa nu "Riscul de a dezolta Anemia este risc scazut deoarece...
        Foloseste analizele incarcate anterior`
        const message = `${this.medicalContext}\n\n ${m}`;
        const res = await firstValueFrom(this.chatService.sendMessage(message)) as ChatResponse;
        riskItem.response = res.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error getting risk details:', error);
      throw error;
    } finally {
      this.chatIsLoading = false;
    }
  }
  private parseRiskItems(): void {
    const lines = this.response.split('\n').filter(line => line.trim());
    this.riskItems = lines.map(line => {
      const [name, level] = line.split(':').map(part => part.trim());
      return { name, level };
    });
  }
  async getLatestReportId(id: number): Promise<string | null> {
    try {
      const response = await firstValueFrom(this.reportService.getReportsByUserId(id));
      this.userReports = response;
      this.mostRecentReport = this.userReports[0];
      
      for (let i = 1; i < this.userReports.length; i++) {
        const currentReport = this.userReports[i];
        const currentDate = this.parseDate(currentReport.reportDate);
        const latestDate = this.parseDate(this.mostRecentReport.reportDate);
        if (currentDate > latestDate) {
          this.mostRecentReport = currentReport;
        }
      }
      this.scoreModel.reportId = this.mostRecentReport.reportId;
      return this.mostRecentReport.reportId;
    } catch (error) {
      console.error('Error getting latest report:', error);
      throw error;
    }
  }
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  get openCard(): { name: string; level: string; response?: string; isOpen?: boolean } | undefined {
    return this.riskItems.find(risk => risk.isOpen);
  }

  get hasOpenCard(): boolean {
    return this.riskItems.some(risk => risk.isOpen);
  }

  get openCardResponse(): string | undefined {
    return this.openCard?.response;
  }
}