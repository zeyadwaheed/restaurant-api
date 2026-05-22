import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { Cuisine } from './restaurant.schema';
import { NearbyQueryDto } from './dto/nearby-query.dto';



@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all restaurants, optionally filtered by cuisine' })
  @ApiQuery({ name: 'cuisine', enum: Cuisine, required: false })
  findAll(@Query('cuisine') cuisine?: Cuisine) {
    return this.restaurantsService.findAll(cuisine);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find restaurants within 1KM radius using geospatial query' })
  @ApiQuery({ name: 'longitude', type: Number, required: true, example: 31.2357 })
  @ApiQuery({ name: 'latitude', type: Number, required: true, example: 30.0444 })
  findNearby(@Query() query: NearbyQueryDto) {
    return this.restaurantsService.findNearby(query.longitude, query.latitude);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get restaurant by MongoDB ID or slug (unique-name)' })
  @ApiParam({ name: 'idOrSlug', description: 'Restaurant ObjectId or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.restaurantsService.findOne(idOrSlug);
  }
}
