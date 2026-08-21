import { IsString, Length } from 'class-validator';

// A comment can change its body, but never its target or author.
export class UpdateCommentDto {
  @IsString()
  @Length(1, 5000)
  body!: string;
}
