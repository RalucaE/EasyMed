import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { ReportComponent } from './pages/report/report.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ScoresComponent } from './pages/scores/scores.component';
import { ChartsComponent } from './pages/charts/charts.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';

const routes: Routes = [
  { path:'', component: HomeComponent},
  { path:'#', component: HomeComponent},
  { path:'register', component: RegisterComponent},
  { path:'login', component: LoginComponent},
  { path:'home', component: HomeComponent},
  { path:'report', component: ReportComponent},
  { path:'reports', component: ReportsComponent},
  { path:'scores', component: ScoresComponent},
  { path:'charts', component: ChartsComponent},
  { path:'user-details', component: UserDetailsComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }