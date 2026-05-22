import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RestaurantDocument = Restaurant & Document;

// list of allowed cuisines for restaurants
export enum Cuisine {
  FRIED = 'Fried',
  ASIAN = 'Asian',
  BURGERS = 'Burgers',
  PIZZA = 'Pizza',
  SUSHI = 'Sushi',
  MEXICAN = 'Mexican',
  ITALIAN = 'Italian',
  INDIAN = 'Indian',
  SEAFOOD = 'Seafood',
  VEGAN = 'Vegan',
}

@Schema({ timestamps: true })
export class Restaurant {
  @ApiProperty({ example: 'Pizza Palace' })
  @Prop({ required: true, trim: true })
  nameEn!: string;

  @ApiProperty({ example: 'بيتزا بالاس' })
  @Prop({ required: true, trim: true })
  nameAr!: string;

  @ApiProperty({ example: 'pizza-palace' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @ApiProperty({ enum: Cuisine, isArray: true, example: [Cuisine.PIZZA] })
  @Prop({
    type: [String],
    enum: Object.values(Cuisine),
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 1 && v.length <= 3,
      message: 'A restaurant must have between 1 and 3 cuisines',
    },
  })
  cuisines!: Cuisine[];

  @ApiProperty({
    example: { type: 'Point', coordinates: [31.2357, 30.0444] },
    description: 'GeoJSON Point — [longitude, latitude]',
  })
  @Prop({
    type: MongooseSchema.Types.Mixed, // object
    required: true,
  })
  location!: {
    type: string;
    coordinates: [number, number];
  };
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// tell Mongoose the exact shape of location for geospatial indexing
RestaurantSchema.path('location', new MongooseSchema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },
}));

// creating geospatial index for location
RestaurantSchema.index({ location: '2dsphere' });
RestaurantSchema.index({ cuisines: 1 });
