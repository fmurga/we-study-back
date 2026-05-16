import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TypesenseService } from '../typesense/typesense.service';
import { JwtPayload } from './interfaces';
import { CreateUserDto, LoginUserDto } from './dto';
import { isUUID } from 'class-validator';
import { UpdateUserDto } from './dto/update-user.dto';

export class UserDto {
  id?: string;
  email?: string;
  fullName?: string;
  username?: string;
  isActive?: boolean;
  image?: string;
  roles?: string[];
  posts?: { id: string }[];
  password?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly typesense: TypesenseService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: bcrypt.hashSync(password, 10),
        },
      });

      await this.typesense.indexUser(user);

      return {
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        image: user.image,
        id: user.id,
        token: this.getJwtToken({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          image: user.image,
        }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  verifyTokenExpiration(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(`Invalid token ${error.message}`);
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    decodedToken: any,
    file?: any,
  ): Promise<UserDto> {
    const user = await this.findOne(id);

    if (user.id !== decodedToken.id) {
      throw new UnauthorizedException('You are not authorized to update this user');
    }

    if (file) {
      updateUserDto.image = file.secure_url;
    } else {
      updateUserDto.image = decodedToken.image;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    await this.typesense.indexUser(updated);

    return this.findOne(id);
  }

  async findAllUsernames(): Promise<string[]> {
    const users = await this.prisma.user.findMany({ select: { username: true } });
    return users.map((u) => u.username);
  }

  async findOne(term: string) {
    let user: User | null;

    if (isUUID(term)) {
      user = await this.prisma.user.findUnique({ where: { id: term } });
    } else {
      user = await this.prisma.user.findFirst({
        where: { username: { equals: term, mode: 'insensitive' } },
      });
    }

    if (!user) throw new NotFoundException(`User with ${term} not found`);

    const posts = await this.prisma.post.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    return { ...user, posts };
  }

  async findOnePlain(term: string) {
    return this.findOne(term);
  }

  async validateGoogleUser(profile: any): Promise<any> {
    const { googleId, fullName, email, image } = profile;

    let user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) {
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      user = await this.prisma.user.create({
        data: {
          email,
          fullName,
          image,
          googleId,
          isActive: true,
          password: null,
          username: `${baseUsername}_${Date.now()}`,
        },
      });
    }

    const token = this.getJwtToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      image: user.image,
    });

    return { ...user, token };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }
    return { message: 'User information from Google', user: req.user };
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        image: true,
        password: true,
      },
    });

    if (!user) throw new UnauthorizedException('Credentials are not valid (email)');
    if (!bcrypt.compareSync(password, user.password!))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      image: user.image,
      username: user.username,
      token: this.getJwtToken({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
      }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      token: this.getJwtToken({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
      }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
