import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiConsumes, 
  ApiBody, 
  ApiResponse 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  }))
  @ApiOperation({ summary: 'New user registration (with Avatar Upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User registration data along with an optional avatar file',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'user@mail.com' },
        password: { type: 'string', example: 'password123' },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Optional profile picture (Image format only)',
        },
      },
      required: ['name', 'email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Email already exists or invalid input.' })
  async create(@Body() createAuthDto: CreateAuthDto, @UploadedFile() image?: Express.Multer.File) {
    return this.authService.create(createAuthDto, image);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login (Returns Access & Refresh Tokens)' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns tokens.' })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate new Access Token (Using Refresh Token)' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }
}