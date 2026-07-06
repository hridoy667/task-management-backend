import { BadRequestException, Injectable, Post, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { saveUploadedFile } from 'src/common/helpers/fileupload';
import { comparePasswords, hashPassword } from 'src/common/helpers/password-helper';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from 'src/common/utils/jwt-token.util';
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

    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokenPayload = { userId: user.id, email: user.email };

    const accessToken = signAccessToken(this.jwtService, tokenPayload);
    const refreshToken = signRefreshToken(this.jwtService, { userId: user.id });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashToken(refreshToken),
      },
    });

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(rawRefreshToken: string) {
    const payload = verifyRefreshToken(this.jwtService, rawRefreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const incomingHash = hashToken(rawRefreshToken);
    if (user.refreshToken !== incomingHash) {
      throw new UnauthorizedException('Invalid token validation');
    }

    const accessToken = signAccessToken(this.jwtService, {
      userId: user.id,
      email: user.email,
    });

    return {
      success: true,
      accessToken,
    };
  }

}
