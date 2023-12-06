import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    create(createLessonDto: CreateLessonDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateLessonDto: UpdateLessonDto): string;
    remove(id: string): string;
}
