import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFollowsController } from './user-follows.controller';
import { UserFollowsService } from './user-follows.service';
import { UserFollow, UserFollowSchema } from './user-follow.schema';
import { UsersModule } from '../users/users.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFollow.name, schema: UserFollowSchema },
    ]),
    UsersModule, // import to access UserModel in the service
    RestaurantsModule, // import to access RestaurantModel in the service
  ],
  controllers: [UserFollowsController],
  providers: [UserFollowsService],
})
export class UserFollowsModule {}
