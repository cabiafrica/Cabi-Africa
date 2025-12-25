import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

/**
 * Data Transfer Object for a single FAQ item.
 */
export class FaqItemDto {
  id: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNumber()
  order: number;
}

/**
 * Data Transfer Object for editable page content.
 */
export class PageContentDto {
  slug: string;
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string; // Markdown or HTML
}