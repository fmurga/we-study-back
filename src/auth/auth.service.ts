import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { isUUID } from 'class-validator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private configService: ConfigService,

    @InjectRepository(User)
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

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
      // TODO: Retornar el JWT de acceso
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // async verifyToken(token: any): Promise<any> {
  //   try {
  //     const secretKey = this.configService.get('JWT_SECRET_KEY'); // Assuming you have set the secret key for jwtService
  //     const tokenToValidate = token.token;
  //     const decodedToken = jwt.verify(tokenToValidate, secretKey); // Verify the token
  //     return decodedToken;
  //   } catch (error) {
  //     throw new UnauthorizedException(`Invalid token ${error.message}`);
  //   }
  // }

  verifyTokenExpiration(token: string) {
    try {
      const secretKey = this.configService.get('JWT_SECRET_KEY');
      const decodedToken = jwt.verify(token, secretKey); // Replace 'your_secret_key_here' with your actual secret key
      return { ok: true };
    } catch (error) {
      throw new UnauthorizedException(`Invalid token ${error.message}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { ...toUpdate } = updateUserDto;

    const post = await this.userRepository.preload({ id, ...toUpdate });

    if (!post) throw new NotFoundException(`Post with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(post);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    let user: User;
    if (isUUID(term)) {
      user = await this.userRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.userRepository.createQueryBuilder();
      user = await queryBuilder
        .where('UPPER(username) =:username', {
          username: term.toUpperCase(),
        })
        .getOne();
    }

    if (!user) throw new NotFoundException(`user with ${term} not found`);

    return user;
  }

  async findOnePlain(term: string) {
    const { ...rest } = await this.findOne(term);
    return {
      ...rest,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        username: true,
        fullName: true,
        email: true,
        image: true,
        password: true,
        id: true,
      }, //! OJO!
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!bcrypt.compareSync(password, user.password))
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
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
