import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument, Cuisine } from './restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  // create a new restaurant, ensuring the slug is unique
  async create(dto: CreateRestaurantDto): Promise<RestaurantDocument> {
    const existing = await this.restaurantModel.findOne({ slug: dto.slug.toLowerCase() });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" is already in use`);
    }

    const restaurant = new this.restaurantModel({
      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      slug: dto.slug.toLowerCase(),
      cuisines: dto.cuisines,
      // store as GeoJSON Point: [longitude, latitude]
      location: {
        type: 'Point',
        coordinates: [dto.location.longitude, dto.location.latitude],
      },
    });

    return restaurant.save();
  }

  // get all resturants
  async findAll(cuisine?: Cuisine): Promise<RestaurantDocument[]> {
    const filter = cuisine ? { cuisines: cuisine } : {};
    return this.restaurantModel.find(filter).exec();
  }

  // find a restaurant by slug or ID
  async findOne(idOrSlug: string): Promise<RestaurantDocument> {
    // try slug first, then ObjectId
    let restaurant = await this.restaurantModel.findOne({ slug: idOrSlug });

    if (!restaurant) {
      // check if it looks like a valid ObjectId
      if (idOrSlug.match(/^[a-f\d]{24}$/i)) {
        restaurant = await this.restaurantModel.findById(idOrSlug);
      }
    }

    if (!restaurant) {
      throw new NotFoundException(`Restaurant "${idOrSlug}" not found`);
    }

    return restaurant;
  }

  // find restaurants near a given location within a certain radius (in meters)
  async findNearby(
    longitude: number,
    latitude: number,
    radiusMeters = 1000,
  ): Promise<RestaurantDocument[]> {
    return this.restaurantModel
      .find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusMeters, // 1000 meters = 1KM
          },
        },
      })
      .exec();
  }
}
