import { IsEnum, IsUUID } from 'class-validator';
import { CommentTargetType } from '../comment.enums';

// Validates the polymorphic comment target at the HTTP boundary.
export class QueryCommentsDto {
  @IsEnum(CommentTargetType)
  targetType!: CommentTargetType;

  @IsUUID()
  targetId!: string;
}
