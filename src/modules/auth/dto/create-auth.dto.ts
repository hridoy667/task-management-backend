import { IsEmail, IsString } from "class-validator";

export class CreateAuthDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}

export class LoginAuthDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}