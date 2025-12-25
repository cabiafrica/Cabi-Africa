/**
 * Data Transfer Object for route details.
 */
export class RouteDetailsDto {
  /**
   * An encoded polyline string representing the route path.
   */
  polyline: string;

  /**
   * Estimated travel time in seconds.
   */
  durationSeconds: number;

  /**
   * Route distance in meters.
   */
  distanceMeters: number;
}