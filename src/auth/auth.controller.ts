import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  Param,
  Patch,
  Put,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';

import { AuthService, UserDto } from './auth.service';
import { RawHeaders, GetUser, Auth } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';

import { CreateUserDto, LoginUserDto } from './dto';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { User } from './entities/user.entity';
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
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Headers('Authorization') authHeader: string
  ): Promise<UserDto> {
    const token = authHeader.split(' ')[1];
    const decodedToken = await this.authService.verifyTokenExpiration(token);
    return this.authService.updateUser(id, updateUserDto, decodedToken);
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
  @Redirect('http://localhost:3000') // Redirect to your frontend after login
  async googleAuthRedirect(@Req() req) {
    // Handles the Google OAuth2 callback
    return this.authService.googleLogin(req);
  }
}
