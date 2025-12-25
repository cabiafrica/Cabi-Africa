import { IsString, IsNotEmpty, IsNumber, Min, IsDateString } from 'class-validator';

/**
 * DTO representing a single business expense.
 */
export class ExpenseDto {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO 8601 string
}

/**
 * DTO for creating a new business expense.
 */
export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  date: string; // ISO 8601 string
}