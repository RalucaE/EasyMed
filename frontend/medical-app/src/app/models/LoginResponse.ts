import { User } from "../entities/User";

export class LoginResponse {
    token!: string;
    user!: User;
}
