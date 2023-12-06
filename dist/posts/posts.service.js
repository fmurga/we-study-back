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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./entities/post.entity");
const uuid_1 = require("uuid");
const post_image_entity_1 = require("./entities/post-image.entity");
let PostsService = class PostsService {
    constructor(postRepository, postImageRepository, dataSource) {
        this.postRepository = postRepository;
        this.postImageRepository = postImageRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger('PostsService');
    }
    async create(createPostDto) {
        try {
            const { images = [], ...postDetails } = createPostDto;
            const post = this.postRepository.create({
                ...postDetails,
                images: images.map((image) => this.postImageRepository.create({ url: image })),
            });
            await this.postRepository.save(post);
            return post;
        }
        catch (error) {
            this.handleDBExceptions(error);
        }
    }
    async findAll(paginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        const posts = await this.postRepository.find({
            take: limit,
            skip: offset,
            relations: {
                images: true,
            },
        });
        return posts.map((post) => ({
            ...post,
            images: post.images.map((img) => img.url),
        }));
    }
    async findOne(term) {
        let post;
        if ((0, uuid_1.validate)(term)) {
            post = await this.postRepository.findOneBy({ id: term });
        }
        else {
            const queryBuilder = this.postRepository.createQueryBuilder();
            post = await queryBuilder
                .where('UPPER(title) =:title or slug =:slug', {
                title: term.toUpperCase(),
                slug: term.toLowerCase(),
            })
                .getOne();
        }
        if (!post)
            throw new common_1.NotFoundException(`Post with ${term} not found`);
        return post;
    }
    async findOnePlain(term) {
        const { images = [], ...rest } = await this.findOne(term);
        return {
            ...rest,
            images: images.map((image) => image.url),
        };
    }
    async update(id, updatePostDto) {
        const { images, ...toUpdate } = updatePostDto;
        const post = await this.postRepository.preload({ id, ...toUpdate });
        if (!post)
            throw new common_1.NotFoundException(`Post with id: ${id} not found`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (images) {
                await queryRunner.manager.delete(post_image_entity_1.PostImage, { post: { id } });
                post.images = images.map((image) => this.postImageRepository.create({ url: image }));
            }
            await queryRunner.manager.save(post);
            await queryRunner.commitTransaction();
            await queryRunner.release();
            return this.findOnePlain(id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.handleDBExceptions(error);
        }
    }
    async remove(id) {
        const post = await this.findOne(id);
        await this.postRepository.remove(post);
    }
    async deleteAllPosts() {
        const query = this.postRepository.createQueryBuilder('post');
        try {
            return await query.delete().where({}).execute();
        }
        catch (error) {
            this.handleDBExceptions(error);
        }
    }
    handleDBExceptions(error) {
        if (error.code === '23505')
            throw new common_1.BadRequestException(error.detail);
        this.logger.error(error);
        throw new common_1.InternalServerErrorException('Unexpected error, check server logs');
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PostsService);
//# sourceMappingURL=posts.service.js.map