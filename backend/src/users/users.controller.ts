import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // Ensure it's imported
import { Roles } from '../auth/decorators/roles.decorator'; // Ensure you have this
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import cloudinary from '../common/utils/cloudinary';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ✅ Secure this route so only ADMINs can access
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.usersService.findAll(); 
  }

  // Optional: you can guard this if needed
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUserProfile(id, dto);
  }

  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = req.user.sub;
    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: 'avatars',
    });
    return this.usersService.updateAvatar(userId, uploaded.secure_url);
  }
}
