import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAuthDto {

    @ApiProperty({ example: 'John Doe', description: 'user name' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'user@mail.com', description: 'user email' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'password123', description: 'user password' })
    @IsString()
    password!: string;
}

export class LoginAuthDto {
    @ApiProperty({ example: 'user@mail.com', description: 'user email' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'password123', description: 'user password' })
    @IsString()
    password!: string;
}