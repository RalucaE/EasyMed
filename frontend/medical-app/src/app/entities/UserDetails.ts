export class UserDetails {
  id!: number;
  userId!: number;
  gender!: string;
  age!: number;
  weight!: number;
  height!: number;
  waistCircumference!: number;
  arterialTension!: string;
  alcoholConsumption!: string;
  physicalActivityLevel!: string;
  smoking!: boolean;
  diabetes!: boolean;
  hypertension!: boolean;
  autoimmuneDiseases!: boolean;
  allergies!: string;

  constructor(
    id: number = 0,
    userId: number = 0,
    gender: string = '',
    age: number = 0,
    weight: number = 0,
    height: number = 0,
    waistCircumference: number = 0,
    arterialTension: string = '',
    alcoholConsumption: string = '',
    physicalActivityLevel: string = '',
    smoking: boolean = false,
    diabetes: boolean = false,
    hypertension: boolean = false,
    autoimmuneDiseases: boolean = false,
    allergies: string = ''  
  ) {
    this.id = id;
    this.userId = userId;
    this.gender = gender;
    this.age = age;
    this.weight = weight;
    this.height = height;
    this.waistCircumference = waistCircumference;
    this.arterialTension = arterialTension;
    this.alcoholConsumption = alcoholConsumption;
    this.physicalActivityLevel = physicalActivityLevel;
    this.smoking = smoking;
    this.diabetes = diabetes;
    this.hypertension = hypertension;
    this.autoimmuneDiseases = autoimmuneDiseases;
    this.allergies = allergies;
  }
}