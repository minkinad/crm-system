import { IsEnum, IsString, IsUUID, Length } from 'class-validator';
import { CommentTargetType } from '../comment.enums';

// DTO for creating comments on target entities.
export class CreateCommentDto {
  @IsEnum(CommentTargetType)
  targetType!: CommentTargetType;

  @IsUUID()
  targetId!: string;

  @IsString()
  @Length(1, 5000)
  body!: string;
}
