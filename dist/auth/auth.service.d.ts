import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    create(createUserDto: CreateUserDto): Promise<{
        token: string;
        id: string;
        email: string;
        password: string;
        fullName: string;
        username: string;
        isActive: boolean;
        roles: string[];
        posts: import("../posts/entities/post.entity").Post[];
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        token: string;
    }>;
    checkAuthStatus(user: User): Promise<{
        token: string;
        id: string;
        email: string;
        password: string;
        fullName: string;
        username: string;
        isActive: boolean;
        roles: string[];
        posts: import("../posts/entities/post.entity").Post[];
    }>;
    private getJwtToken;
    private handleDBErrors;
}
