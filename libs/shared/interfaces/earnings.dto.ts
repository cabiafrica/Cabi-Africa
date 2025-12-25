import { IsNumber, Min } from 'class-validator';

/**
 * DTO representing a driver's earnings goal and progress.
 */
export class EarningsGoalDto {
  weeklyGoalAmount: number;
  currentWeeklyEarnings: number;
}

/**
 * DTO for setting a driver's weekly earnings goal.
 */
export class SetEarningsGoalDto {
  @IsNumber()
  @Min(0)
  weeklyGoalAmount: number;
}

/**
 * DTO representing a downloadable earnings statement.
 */
export class EarningsStatementDto {
  id: string;
  periodName: string; // e.g., "Week of Aug 19, 2024"
  startDate: string;
  endDate: string;
  downloadUrl: string;
}

/**
 * Represents a single earnings period (e.g., today, this week).
 */
export class EarningsPeriodSummary {
  tripEarnings: number;
  commissionEarnings: number;
  total: number;
}

/**
 * DTO for the main earnings summary dashboard.
 */
export class EarningsSummaryDto {
  summary: {
    today: EarningsPeriodSummary;
    thisWeek: EarningsPeriodSummary;
    thisMonth: EarningsPeriodSummary;
  };
  recentTransactions: TransactionDto[];
}

/**
 * DTO for a single transaction line item in the earnings history.
 */
export class TransactionDto {
  id: string;
  date: string; // ISO 8601
  type: 'Trip Fare' | 'Commission' | 'Payout' | 'Adjustment';
  amount: number;
  description: string;
}

/**
 * DTO for the basic earnings dashboard.
 */
export class EarningsDashboardDto {
  availableBalance: number;
}