import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Cuisine } from '../restaurants/restaurant.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'Ahmed Hassan', description: 'Full name of the user' })
  @Prop({ required: true, trim: true })
  fullName!: string;

  @ApiProperty({
    enum: Cuisine,
    isArray: true,
    example: [Cuisine.PIZZA, Cuisine.ASIAN],
    description: 'User favourite cuisines',
  })
  @Prop({
    type: [String],
    enum: Object.values(Cuisine),
    required: true,
  })
  favoriteCuisines!: Cuisine[];
}

export const UserSchema = SchemaFactory.createForClass(User);
