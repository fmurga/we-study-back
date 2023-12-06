"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = require("crypto");
const lesson_entity_1 = require("../../lessons/entities/lesson.entity");
const post_entity_1 = require("../../posts/entities/post.entity");
const typeorm_1 = require("typeorm");
let Tag = class Tag {
};
exports.Tag = Tag;
__decorate([
    (0, swagger_1.ApiProperty)({ example: (0, crypto_1.randomUUID)() }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tag.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AM1' }),
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'am1' }),
    (0, typeorm_1.Column)({ type: 'text', unique: true }),
    __metadata("design:type", String)
], Tag.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'active' }),
    (0, typeorm_1.Column)({
        type: 'text',
        default: 'active',
    }),
    __metadata("design:type", String)
], Tag.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => post_entity_1.Post, (post) => post.tags),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Tag.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => lesson_entity_1.Lesson, (leson) => leson.tags),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Tag.prototype, "lessons", void 0);
exports.Tag = Tag = __decorate([
    (0, typeorm_1.Entity)('tags')
], Tag);
//# sourceMappingURL=tag.entity.js.map