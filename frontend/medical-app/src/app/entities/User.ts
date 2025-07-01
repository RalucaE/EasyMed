import { UserDetails } from "./UserDetails";
export class User {
    id!: number;
    fullName!: string;
    username!: string;
    email!: string;
    password!: string;
    roleName!: string;
    userDetails!: UserDetails;

    constructor(
        id: number = 0,
        fullName: string = '',
        username: string = '',
        email: string = '',
        password: string = '',
        roleName: string = 'User',
        userDetails: UserDetails = new UserDetails()
        ) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.roleName = roleName;
        this.userDetails = userDetails;
        }
}