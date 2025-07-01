import { Component } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ChartType,
  ApexYAxis,
  ApexMarkers,
  ApexTooltip,
  ApexAnnotations,
} from "ng-apexcharts";
import { ElasticPdfModel } from 'src/app/models/ElasticPdfModel';
import { ReportsService } from 'src/app/services/reports.service';
import { firstValueFrom } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { ChatResponse } from 'src/app/models/ChatResponse';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  annotations?: ApexAnnotations;
  stroke?: ApexStroke;
  markers?: ApexMarkers;
  tooltip?: ApexTooltip;
  yaxis?: ApexYAxis;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent {
  isLoading: boolean = false;
  isChatLoading: boolean = false;
  isChatResponseLoading: boolean = false;
  hasReports: boolean = true;
  data: any = null; 
  ids: ElasticPdfModel[] = [];
  userReports: any[] = [];
  reportDates: any[] = [];
  userId = localStorage.getItem('userId')!;
  titles: string[]= [];
  selectedOption: string = '';
  chartOptions!: ChartOptions;
  medicalContext: string = '';
  chatResponse: string = '';
  outOfRangeValues: any[] = [];
  response: string[] | null = null;

  constructor(
    private reportService: ReportsService, 
    private chatService: ChatService
  ) {}

  ngOnInit(): void { 
    this.isChatLoading = true;
    this.reportsByUserId(parseInt(this.userId));
  }

  reportsByUserId(id: number) {
    this.reportService.getReportsByUserId(id).subscribe(response => {
      this.userReports = response;
      if(this.userReports.length === 0) {
        this.hasReports = false;
        this.isLoading = false;
        this.isChatLoading = false;
        return;
      }
      this.hasReports = true;
      this.userReports.forEach(report => {
        this.reportDates.push(report.reportDate)
        let newModel = new ElasticPdfModel();
        newModel.id = report.reportId;
        this.ids.push(newModel)
      })
      this.getData(this.ids);
    })
  }

  getData(documentIds: ElasticPdfModel[]) {
    this.isLoading = true;
    this.reportService.compareReports(documentIds).subscribe((response => {
      this.data = response[0].data;
      this.reportDates = response[1].reportDate;
      // Sort dates in ascending order
      this.reportDates.sort((a, b) => {
        const dateA = new Date(a.split('.').reverse().join('-'));
        const dateB = new Date(b.split('.').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
      if(this.data) {
        this.data.forEach((element: any, index: number) => {
          if(element.values.length <= 1) {
            this.data.splice(index,1)
          }
          else {
            this.titles.push(element.name);
          }
        });           
        const lowerLimit = parseFloat(this.data[0].min);
        const upperLimit = parseFloat(this.data[0].max);
        const dataMin = Math.min(...this.data[0].values);
        const dataMax = Math.max(...this.data[0].values);
        
        // Calculate the range and add padding
        const range = Math.max(dataMax, upperLimit) - Math.min(dataMin, lowerLimit);
        const padding = range * 0.1; // 10% padding
        const yMin = Math.floor((Math.min(dataMin, lowerLimit) - padding) * 10) / 10;
        const yMax = Math.ceil((Math.max(dataMax, upperLimit) + padding) * 10) / 10;
        this.chartOptions = {
          title: {
            text: "Evolutia analizelor"
          },
          series: [
            {
              name: "Value",
              data: this.data[0].values
            }]
          ,
          chart: {
            height: 350,
            type: 'line' as ChartType,
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: true
          },
          grid: {
            row: {
              colors: ["#f3f3f3", "transparent"],
              opacity: 0.5
            }
          },
          xaxis: {            
            categories: this.reportDates
          },
          yaxis: {            
            min: yMin,
            max: yMax,
            tickAmount: 10
          },
          annotations: {
            yaxis: [
              {
                y: upperLimit,
                borderColor: '#FF0000',
                strokeDashArray: 5,
                label: {
                  text: 'Limita superioară',
                  style: {
                    color: '#FFFFFF',
                    background: '#FF0000',
                    fontSize: '12px',
                    padding: {
                      left: 5,
                      right: 5,
                      top: 2,
                      bottom: 2
                    }
                  }
                }
              },
              {
                y: lowerLimit,
                borderColor: '#0000FF',
                strokeDashArray: 5,
                label: {
                  text: 'Limita inferioară',
                  style: {
                    color: '#FFFFFF',
                    background: '#0000FF',
                    fontSize: '12px',
                    padding: {
                      left: 5,
                      right: 5,
                      top: 2,
                      bottom: 2
                    }
                  }
                }
              }
            ]
          },
        };
        this.selectedOption = this.titles[0];
        this.isLoading = false;
        var analyseData = {
          data: this.data,
          reportDates: this.reportDates
        }
        this.analyseChartWithChat(analyseData);
        
      }       
    }));
  }

  onOptionSelected(value: string): void {
    if (value) {
      const selectedData = this.data.find((element: { name: string; }) => element.name === value);
      if (selectedData) {
       
        var lowerLimit = parseFloat(selectedData.min);
        var upperLimit = parseFloat(selectedData.max);
        var yMax;
        var yMin;
               
        const dataMin = Math.min(...selectedData.values);
        const dataMax = Math.max(...selectedData.values);
        if(Number.isNaN(lowerLimit) || Number.isNaN(upperLimit)) {
          if(Number.isNaN(lowerLimit)) {         
            const range = Math.max(dataMax, upperLimit) - dataMin;          
            const padding = range * 0.1; 
            yMin = Math.floor((dataMin - padding) * 10) / 10;
            yMax = Math.ceil((Math.max(dataMax, upperLimit) + padding) * 10) / 10;
          }
          if(Number.isNaN(upperLimit)) {
            const range = dataMax - Math.min(dataMin, lowerLimit);
            const padding = range * 0.1; // 10% padding  
            yMin = Math.floor((Math.min(dataMin, lowerLimit) - padding) * 10) / 10;        
            yMax = Math.ceil((dataMax + padding) * 10) / 10;
          }
          if(Number.isNaN(lowerLimit) && Number.isNaN(upperLimit)) {
            const range = dataMax - dataMin;
            const padding = range * 0.1;
            yMin = Math.floor((dataMin - padding) * 10) / 10;        
            yMax = Math.ceil((dataMax + padding) * 10) / 10;
          }
        }
        else {
          const range = Math.max(dataMax, upperLimit) - Math.min(dataMin, lowerLimit);
          const padding = range * 0.1; // 10% padding
          yMin = Math.floor((Math.min(dataMin, lowerLimit) - padding) * 10) / 10;
          yMax = Math.ceil((Math.max(dataMax, upperLimit) + padding) * 10) / 10;
        }
        this.analyseEachValue(selectedData);
        this.chartOptions = {  
          ...this.chartOptions,
          series: [{ 
            ...this.chartOptions.series[0], 
            data: selectedData.values  as number[]
          }],
          xaxis: {
            ...this.chartOptions.xaxis, 
            categories: this.reportDates
          },
          yaxis: {            
            min: yMin,
            max: yMax,
            tickAmount: 10
          },
          annotations: {
            yaxis: [
              ...(Number.isNaN(upperLimit) ? [] : [{
                y: upperLimit,
                borderColor: '#FF0000',
                strokeDashArray: 5,
                label: {
                  text: 'Limita superioară',
                  style: {
                    color: '#FFFFFF',
                    background: '#FF0000',
                    fontSize: '12px',
                    padding: {
                      left: 5,
                      right: 5,
                      top: 2,
                      bottom: 2
                    }
                  }
                }
              }]),
              
                ...(Number.isNaN(lowerLimit) ? [] : [{
                y: lowerLimit,
                borderColor: '#0000FF',
                strokeDashArray: 5,
                label: {
                  text: 'Limita inferioară',
                  style: {
                    color: '#FFFFFF',
                    background: '#0000FF',
                    fontSize: '12px',
                    padding: {
                      left: 5,
                      right: 5,
                      top: 2,
                      bottom: 2
                    }
                  }
                }
              }])                         
            ]
          }
        };
      }
    }
  }
  async analyseChartWithChat(analyseData: any): Promise<any> {
    this.isChatLoading = true;
    analyseData.data.forEach((d: any) => {
      d.values.forEach((value: any, index: number) => {
        
        if(parseFloat(value.replace(/\s+/g, '')) < parseFloat(d.min)){
          var arr = {
            name: d.name,
            valueOutOfRange: parseFloat(value.replace(/\s+/g, '')),
            range: `${d.min}-${d.max}`,
            date: analyseData.reportDates[index]
          }
       
          this.outOfRangeValues.push(arr);
        }
        if(parseFloat(value.replace(/\s+/g, '')) > parseFloat(d.max)) {        
          var arr = {
            name: d.name,
            valueOutOfRange: parseFloat(value.replace(/\s+/g, '')),
            range: `${d.min}-${d.max}`,
            date: analyseData.reportDates[index]
          }
          this.outOfRangeValues.push(arr);
        }
      });
    });
    this.medicalContext = `
        Analize Medicale :
        ${analyseData.data.map((d: any) => `
        Nume: ${d.name}
        Rezultate: ${d.values}
        Intervalul de referinta: ${d.min}-${d.max}
        `).join('\n')}
        Analize Medicale inafara intervalului de referinta:
        ${this.outOfRangeValues.map((d: any) => `
        Nume: ${d.name}
        Valoare inafara intervalului de referinta: ${d.valueOutOfRange}
        Intervalul de referinta: ${d.range}
        Data: ${d.date}
        `).join('\n')}
      `;

    var m = `Intrebare User:Vreau sa analizezi valorile din ${this.medicalContext}. 
    Ofera un rezumat scurt despre analizele aflate inafara intervalului de referinta. 
    Dar vorbeste in general despre aceste analize, nu lua fiecare valoare in parte.
    Maxim 100 cuvinte
    Mesajul dat va fi afisat in pagina, deci sa nu contina niciun mesaj de genul 
    "Mesajul dat va fi afisat in pagina" sau "Mesajul dat este:"
    Rezumatul sa fie format din 1 paragraf
    O noua idee in paragraf sa fie delimitata de simbolul #
    O idee poate contine mai multe propozitii(maxim 2 propozitii)
    `;
    var message = `${this.medicalContext}\n\n ${m}`;
    const res = await firstValueFrom(this.chatService.sendMessage(message)) as ChatResponse;
    this.chatResponse = res.choices[0].message.content;
    this.response = this.chatResponse.split('#');
    this.isChatLoading = false;
}
  async analyseEachValue(analyseData: any): Promise<any> {
    this.isChatResponseLoading = true;
    this.response = null;
    this.medicalContext = `
      Analiza Medicala :
      Nume: ${analyseData.name}
      Rezultate: ${analyseData.values}
      Intervalul de referinta: ${analyseData.min}-${analyseData.max}
      `;
    var m = `Intrebare User:Vreau sa analizezi evolutia analizei medicale ${this.medicalContext}. 
      Ofera un rezumat scurt despre evolutia analizei, trend-ul, recomandari etc.
      Evita sa pui titluri, sa numerotezi sau sa pui simboluri speciale ca *,
      Rezumatul sa fie format din 1 paragraf
      O noua idee in paragraf sa fie delimitata de simbolul #
      O idee poate contine mai multe propozitii(maxim 2 propozitii)
      `;
      var message = `${this.medicalContext}\n\n ${m}`;
      const res = await firstValueFrom(this.chatService.sendMessage(message)) as ChatResponse;
      this.chatResponse = res.choices[0].message.content;
      this.response = this.chatResponse.split('#');
      this.isChatResponseLoading = false;
  }
}