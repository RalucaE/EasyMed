import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from 'src/app/entities/User';
import { UserDetails } from 'src/app/entities/UserDetails';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  user: User = new User();
  newUser: User = new User();
  userId = localStorage.getItem('userId')!;
  isLoading: boolean = true;
  name: string = "";
  gender: string = "";
  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.getUser(+this.userId);
  }

  getUser(id: number) {
    this.isLoading = true;
    this.authService.getUser(id).subscribe({
      next: (response) => {
        this.user = response;
        this.name = this.user.fullName;
        this.gender = this.user.userDetails.gender;
        if(this.user.userDetails == null){
          this.user.userDetails = {
            id: 0,
            userId: +this.userId,
            gender: "",
            age: 0,
            weight: 0,
            height: 0,
            waistCircumference: 0,
            arterialTension: "",
            alcoholConsumption: "",
            physicalActivityLevel: "",
            smoking: false,
            diabetes: false,
            hypertension: false,
            autoimmuneDiseases: false,
            allergies: ""
          }
        }
        this.isLoading = false;
        localStorage.setItem('userDetails', JSON.stringify(this.user.userDetails));
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
      }
    });
  }

  editUser(newForm: NgForm) {
    const formData = newForm.value;
    if (!this.newUser.userDetails) {
      this.newUser.userDetails = new UserDetails();
    }
    this.newUser.id = +this.userId;
    this.newUser.fullName = formData.fullName;
    this.newUser.username = formData.username;
    this.newUser.userDetails.age = +formData.age;
    this.newUser.userDetails.weight = +formData.weight;
    this.newUser.userDetails.height = +formData.height;
    this.newUser.userDetails.gender = formData.gender;
    this.newUser.userDetails.waistCircumference = +formData.waistCircumference;
    this.newUser.userDetails.arterialTension = formData.arterialTension;
    this.newUser.userDetails.alcoholConsumption = formData.alcoholConsumption;
    this.newUser.userDetails.physicalActivityLevel = formData.physicalActivityLevel;
    this.newUser.userDetails.smoking = formData.smoking;
    this.newUser.userDetails.diabetes = formData.diabetes;
    this.newUser.userDetails.hypertension = formData.hypertension;
    this.newUser.userDetails.autoimmuneDiseases = formData.autoimmuneDiseases;
    this.newUser.userDetails.allergies = formData.allergies;

    this.authService.editUser(this.newUser).subscribe({
      next: (response) => {
        console.log('User edited successfully:', response);
      },
      error: (err) => {
        console.error('Error editing user:', err);
      }
    });
  }
}