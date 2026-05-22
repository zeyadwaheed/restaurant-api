import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserFollowsService } from './user-follows.service';

class FollowRestaurantDto {
  @ApiProperty({ example: '6606abcd1234567890abcdef', description: 'Restaurant ObjectId to follow' })
  @IsMongoId()
  restaurantId!: string;
}

@ApiTags('User Follows & Recommendations')
@Controller('users')
export class UserFollowsController {
  constructor(private readonly userFollowsService: UserFollowsService) {}

  @Post(':userId/follow')
  @ApiOperation({ summary: 'User follows a restaurant' })
  @ApiParam({ name: 'userId', description: 'User MongoDB ObjectId' })
  follow(
    @Param('userId') userId: string,
    @Body() body: FollowRestaurantDto,
  ) {
    return this.userFollowsService.followRestaurant(userId, body.restaurantId);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'List all restaurants followed by a user' })
  @ApiParam({ name: 'userId', description: 'User MongoDB ObjectId' })
  getFollowing(@Param('userId') userId: string) {
    return this.userFollowsService.getFollowedRestaurants(userId);
  }

  @Get(':userId/recommendations')
  @ApiOperation({
    summary: 'Get restaurant recommendations for a user via MongoDB Aggregation Pipeline',
    description: `
      Step 1: Find users who share the same favourite cuisines as the input user.
      Step 2: Retrieve all restaurants followed by those users.
      Step 3: Return both the similar users and recommended restaurants.
    `,
  })
  @ApiParam({ name: 'userId', description: 'User MongoDB ObjectId' })
  getRecommendations(@Param('userId') userId: string) {
    return this.userFollowsService.getRecommendations(userId);
  }
}
