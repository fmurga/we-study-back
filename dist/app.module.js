"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const tags_module_1 = require("./tags/tags.module");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const posts_module_1 = require("./posts/posts.module");
const materials_module_1 = require("./materials/materials.module");
const lessons_module_1 = require("./lessons/lessons.module");
const common_module_1 = require("./common/common.module");
const files_module_1 = require("./files/files.module");
const auth_module_1 = require("./auth/auth.module");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.POSTGRES_HOST,
                port: 5432,
                database: process.env.POSTGRES_DATABASE,
                username: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                autoLoadEntities: true,
                synchronize: true,
                ssl: true,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
            }),
            tags_module_1.TagsModule,
            posts_module_1.PostsModule,
            materials_module_1.MaterialsModule,
            lessons_module_1.LessonsModule,
            common_module_1.CommonModule,
            files_module_1.FilesModule,
            auth_module_1.AuthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map