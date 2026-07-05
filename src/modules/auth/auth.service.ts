import { BadRequestException, Injectable, Post } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { saveUploadedFile } from 'src/common/helpers/fileupload';
import { comparePasswords, hashPassword } from 'src/common/helpers/password-helper';
import { generateAvatarUrl } from 'src/common/helpers/file-url';
import { signRefreshToken } from 'src/common/utils/jwt-token.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async create(createAuthDto: CreateAuthDto, image?: Express.Multer.File) {
    const { name, email, password } = createAuthDto;

    // 1. Check if user exists BEFORE opening a transaction lane
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2. Process image upload if present
    let avatarFilename: string | null = null;
    if (image) {
      avatarFilename = await saveUploadedFile(image, 'avatars');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: avatarFilename
      }
    });

    return {
      success: true,
      message: 'User created successfully'
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;
    console.log(loginAuthDto);
    console.log('Login attempt for email:', email);
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Compare passwords (assuming you have a method to compare hashed passwords)
    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { userId: user.id, email: user.email };

    const refreshToken = signRefreshToken(this.jwtService, payload);

    return {
      success: true,
      message: 'Login successful',
      refreshToken,
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
