import { IsString, IsNotEmpty, IsInt, IsPositive, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  senderId: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  recipientId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}
