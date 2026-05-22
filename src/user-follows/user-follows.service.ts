import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserFollow, UserFollowDocument } from './user-follow.schema';
import { User, UserDocument } from '../users/user.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';

@Injectable()
export class UserFollowsService {
  constructor(
    @InjectModel(UserFollow.name)
    private readonly userFollowModel: Model<UserFollowDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  private validateObjectId(id: string, name: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${name} must be a valid MongoDB ObjectId`);
    }
    return new Types.ObjectId(id);
  }

  // follow a restaurant
  async followRestaurant(userId: string, restaurantId: string): Promise<UserFollowDocument> {
    const userObjectId = this.validateObjectId(userId, 'userId');
    const restaurantObjectId = this.validateObjectId(restaurantId, 'restaurantId');

    const user = await this.userModel.findById(userObjectId);
    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    const restaurant = await this.restaurantModel.findById(restaurantObjectId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant "${restaurantId}" not found`);
    }

    try {
      const follow = new this.userFollowModel({
        userId: userObjectId,
        restaurantId: restaurantObjectId,
      });
      return await follow.save();
    } catch (err: unknown) {
      // mongoDB duplicate key error code
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('User is already following this restaurant');
      }
      throw err;
    }
  }

  // get all restaurants followed by a user
  async getFollowedRestaurants(userId: string): Promise<UserFollowDocument[]> {
    const userObjectId = this.validateObjectId(userId, 'userId');
    const user = await this.userModel.findById(userObjectId);
    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    return this.userFollowModel
      .find({ userId: userObjectId })
      .populate('restaurantId')
      .exec();
  }

  // Resturan Recommendation Algorithm
  // step 1: Find users with similar tastes (overlapping favourite cuisines)
  // step 2: Get restaurants followed by those similar users
  // step 3: Recommend those restaurants to the input user
  async getRecommendations(userId: string): Promise<{
    similarUsers: any[];
    recommendedRestaurants: any[];
  }> {
    const userObjectId = this.validateObjectId(userId, 'userId');
    const targetUser = await this.userModel.findById(userObjectId);
    if (!targetUser) throw new NotFoundException(`User "${userId}" not found`);

    const { favoriteCuisines } = targetUser;
    const targetUserObjectId = userObjectId;

    //aggregation Pipeline:
    // on the UserFollow collection, join Users and Restaurants
    // to find similar users and their followed restaurants.
     
    const pipeline = [
      // stage 1: join UserFollow with Users to access their favoriteCuisines
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },

      // stage 2: Only keep follows from users who:
      //   a) are nOT the input user
      //   b) share at least one favourite cuisine with the input user
      {
        $match: {
          'userDetails._id': { $ne: targetUserObjectId },
          'userDetails.favoriteCuisines': { $in: favoriteCuisines },
        },
      },

      // stage 3: join with Restaurants collection
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurantDetails',
        },
      },
      { $unwind: '$restaurantDetails' },

      // stage 4: group by restaurant to deduplicate, and collect unique similar users
      {
        $group: {
          _id: '$restaurantId',
          restaurant: { $first: '$restaurantDetails' },
          followedByUsers: { $addToSet: '$userDetails' },
        },
      },

      // stage 5: facet to produce two separate result arrays in one query
      {
        $facet: {
          recommendedRestaurants: [
            { $replaceRoot: { newRoot: '$restaurant' } },
          ],
          // flatten and deduplicate users across all restaurant groups
          similarUsers: [
            { $unwind: '$followedByUsers' },
            { $replaceRoot: { newRoot: '$followedByUsers' } },
            { $group: { _id: '$_id', doc: { $first: '$$ROOT' } } },
            { $replaceRoot: { newRoot: '$doc' } },
          ],
        },
      },
    ];

    const [result] = await this.userFollowModel.aggregate(pipeline).exec();

    return {
      similarUsers: result?.similarUsers ?? [],
      recommendedRestaurants: result?.recommendedRestaurants ?? [],
    };
  }
}
