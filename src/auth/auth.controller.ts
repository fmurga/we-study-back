import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Headers,
  Param,
  Patch,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';

import { AuthService, UserDto } from './auth.service';
import { RawHeaders, GetUser, Auth } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';

import { CreateUserDto, LoginUserDto } from './dto';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Patch('update-user/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Headers('Authorization') authHeader: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserDto> {
    const token = authHeader.split(' ')[1];
    const decodedToken = await this.authService.verifyTokenExpiration(token);
    return this.authService.updateUser(id, updateUserDto, decodedToken, file);
  }

  @Get('renew-token')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Post('check-token')
  verifyTokenExpiration(@Body('token') token: string) {
    return this.authService.verifyTokenExpiration(token);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  // @SetMetadata('roles', ['admin','super-user'])

  @Get('usernames')
  async findAllUsernames(): Promise<string[]> {
    return this.authService.findAllUsernames();
  }


  @Get('user/:username')
  async getUserByUsername(@Param('username') username: string): Promise<any> {
    return this.authService.findOnePlain(username);
  }


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    if (!req.user?.token) {
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
    // Pass token to the frontend BFF which will set the httpOnly cookie on the
    // correct domain. This avoids cross-domain cookie issues in production.
    res.redirect(`${frontendUrl}/api/auth/google/callback?token=${req.user.token}`);
  }
}
