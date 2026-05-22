import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { Cuisine } from '../../restaurants/restaurant.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'Ahmed Hassan', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    enum: Cuisine,
    isArray: true,
    example: [Cuisine.PIZZA, Cuisine.ASIAN],
    description: 'User favourite cuisines (at least 1)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Cuisine, { each: true })
  favoriteCuisines!: Cuisine[];
}
