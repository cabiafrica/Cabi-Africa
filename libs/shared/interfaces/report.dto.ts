/**
 * Data Transfer Object for a driver's performance report.
 */
export class DriverPerformanceReportDto {
  driverId: string;
  driverName: string;
  totalRides: number;
  averageRating: number;
  acceptanceRate: number; // e.g., 0.95 for 95%
  totalEarnings: number;
  periodStartDate: string;
  periodEndDate: string;
}