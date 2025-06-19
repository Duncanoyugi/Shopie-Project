import {
  Controller,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import cloudinary from '../common/utils/cloudinary';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
