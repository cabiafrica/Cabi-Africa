import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsInt, ValidateNested } from 'class-validator';

export class MlmFeeRuleDto {
  @IsEnum(['system', 'referrer', 'upline'])
  recipient: 'system' | 'referrer' | 'upline';

  @IsNumber()
  value: number;

  @IsEnum(['fixed', 'percentage'])
  ruleType: 'fixed' | 'percentage';

  @IsInt()
  uplineLevel: number; // 0 for system/referrer, 1+ for upline
}

export class UpdateMlmFormulaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MlmFeeRuleDto)
  rules: MlmFeeRuleDto[];
}