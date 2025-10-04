import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favourite } from './entities/favourite.entity';

@Module({
  controllers: [FavouritesController],
  providers: [FavouritesService],
  imports: [TypeOrmModule.forFeature([Favourite])],
  exports: [TypeOrmModule],
})
export class FavouritesModule { }
