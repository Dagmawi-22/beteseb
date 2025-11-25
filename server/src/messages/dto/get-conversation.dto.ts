import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetConversationDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  userId1: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  userId2: number;
}
