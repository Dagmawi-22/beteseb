import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MessageResponseDto {
  @Expose()
  id: number;

  @Expose()
  senderId: number;

  @Expose()
  recipientId: number;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;
}
