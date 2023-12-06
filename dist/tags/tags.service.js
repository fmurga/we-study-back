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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const tag_entity_1 = require("./entities/tag.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let TagsService = class TagsService {
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
        this.logger = new common_1.Logger('TagsService');
    }
    async create(createTagDto) {
        createTagDto.slug = createTagDto.name.toLowerCase().trim();
        try {
            console.log(createTagDto);
            this.logger.log(createTagDto);
            const tag = this.tagRepository.create(createTagDto);
            await this.tagRepository.save(tag);
            return tag;
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException('Ayuda!');
        }
    }
    findAll() {
        return this.tagRepository.createQueryBuilder().getMany();
    }
    findOne(id) {
        return `This action returns a #${id} tag`;
    }
    update(id, updateTagDto) {
        return `This action updates a #${id} tag`;
    }
    remove(id) {
        return `This action removes a #${id} tag`;
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(tag_entity_1.Tag)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], TagsService);
//# sourceMappingURL=tags.service.js.map