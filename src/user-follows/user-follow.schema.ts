import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserFollowDocument = UserFollow & Document;

// many to many relationship: users can follow many restaurants, and restaurants can be followed by many users
// (junction/bridge table in relational DB terms)
@Schema({ timestamps: true })
export class UserFollow {
  @ApiProperty({ example: '6606abcd1234567890abcdef', description: 'MongoDB ObjectId of the user' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @ApiProperty({ example: '6606abcd1234567890abcdef', description: 'MongoDB ObjectId of the restaurant' })
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: Types.ObjectId;
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);

// compound unique index: a user can only follow a restaurant once
UserFollowSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });
