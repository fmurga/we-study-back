/// <reference types="node" />
/// <reference types="express-serve-static-core" />
/// <reference types="multer" />
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createUser(createUserDto: CreateUserDto): Promise<{
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
    loginUser(loginUserDto: LoginUserDto): Promise<{
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
    testingPrivateRoute(request: Express.Request, user: User, userEmail: string, rawHeaders: string[], headers: IncomingHttpHeaders): {
        ok: boolean;
        message: string;
        user: User;
        userEmail: string;
        rawHeaders: string[];
        headers: IncomingHttpHeaders;
    };
    privateRoute2(user: User): {
        ok: boolean;
        user: User;
    };
    privateRoute3(user: User): {
        ok: boolean;
        user: User;
    };
}
