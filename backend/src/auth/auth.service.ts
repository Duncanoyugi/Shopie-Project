import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { RequestPasswordResetDto } from './dtos/request-password-reset.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { BadRequestException } from '@nestjs/common';
import { Express } from 'express'; 

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  

async register(dto: RegisterDto, file?: Express.Multer.File) {
  const existingUser = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = await this.prisma.user.create({
    data: {
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: hashedPassword,
      avatar: file?.filename || null, // 👈 Save file name if uploaded
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      role: 'CUSTOMER',
    },
  });

  await this.mailService.sendUserWelcome(user.email, user.fullName);

  return {
    message: 'Registration successful. A confirmation email has been sent.',
  };
}


  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Avoid leaking whether the email exists
      return {
        message: 'You are not yet registered.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    await this.mailService.sendPasswordReset(
      user.email,
      user.fullName,
      resetToken,
    );

    return {
      message: 'A password reset link has been sent to your email.',
    };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() }, // still valid
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    await this.mailService.sendPasswordResetSuccess(user.email, user.fullName);

    return { message: 'Password has been reset successfully.' };
  }
}
