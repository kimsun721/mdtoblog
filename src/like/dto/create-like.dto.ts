import { IsEnum, IsNumber } from 'class-validator';
import { LikeEntityType } from '../type/like-entity-type';

export class CreateLikeDto {
  @IsNumber()
  entityId: number;

  @IsEnum(LikeEntityType)
  entityType: LikeEntityType;
}
