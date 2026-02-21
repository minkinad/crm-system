import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

// DTO for comment edits.
export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
