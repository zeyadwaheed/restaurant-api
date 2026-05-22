import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Cuisine } from '../restaurant.schema';

export class LocationDto {
  @ApiProperty({ example: 31.2357, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({ example: 30.0444, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;
}

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Pizza Palace', description: 'Restaurant name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiProperty({ example: 'بيتزا بالاس', description: 'Restaurant name in Arabic' })
  @IsString()
  @IsNotEmpty()
  nameAr!: string;

  @ApiProperty({ example: 'pizza-palace', description: 'Unique slug (will be lowercased)' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    enum: Cuisine,
    isArray: true,
    example: [Cuisine.PIZZA],
    description: 'Between 1 and 3 cuisines',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum(Cuisine, { each: true })
  cuisines!: Cuisine[];

  @ApiProperty({ type: LocationDto, description: 'Restaurant location (longitude, latitude)' })
  @IsDefined()
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;
}
