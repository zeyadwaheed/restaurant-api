import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { UserFollowsModule } from './user-follows/user-follows.module';

@Module({
  imports: [
    // load env variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // connect to MongoDB using env var
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/pleny-restaurant'),

    RestaurantsModule,
    UsersModule,
    UserFollowsModule,
  ],
})
export class AppModule {}
