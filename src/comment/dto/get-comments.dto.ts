import { Expose, Type } from 'class-transformer';

class UserDto {
  @Expose()
  id: number;

  @Expose()
  userName: string;

  @Expose()
  profileUrl: string;
}

export class GetCommentsResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  parentId: number;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
