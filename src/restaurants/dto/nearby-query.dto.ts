import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NearbyQueryDto {
  @ApiPropertyOptional({ example: 31.2357, description: 'Longitude of current position' })
  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({ example: 30.0444, description: 'Latitude of current position' })
  @Type(() => Number)
  @IsNumber()
  latitude!: number;
}
