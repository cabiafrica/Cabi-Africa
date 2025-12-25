import { Injectable, Logger } from '@nestjs/common';

interface Point {
  lat: number;
  lon: number;
}

interface SurgeZone {
  id: string;
  // A simple polygon represented by corner points for the bounding box
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  multiplier: number;
}

@Injectable()
export class FareService {
  private readonly logger = new Logger(FareService.name);

  // Mock data for active surge zones
  private activeSurgeZones: SurgeZone[] = [
    {
      id: 'westlands-surge',
      bounds: {
        minLat: -1.26,
        maxLat: -1.25,
        minLon: 36.8,
        maxLon: 36.81,
      },
      multiplier: 1.5,
    },
  ];

  private readonly BASE_RATE_PER_KM = 50; // KES 50 per km

  /**
   * Calculates the estimated fare for a given route, applying surge pricing
   * to segments that fall within active surge zones.
   * @param route An array of points representing the trip's path.
   * @returns The total estimated fare.
   */
  calculateFare(route: Point[]) {
    if (route.length < 2) {
      return 0;
    }

    let totalFare = 0;
    let totalDistance = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const startPoint = route[i];
      const endPoint = route[i + 1];

      const segmentDistance = this.calculateDistance(startPoint, endPoint);
      totalDistance += segmentDistance;

      // Check if the midpoint of the segment is in a surge zone
      const midPoint = {
        lat: (startPoint.lat + endPoint.lat) / 2,
        lon: (startPoint.lon + endPoint.lon) / 2,
      };

      const activeZone = this.activeSurgeZones.find((zone) =>
        this.isPointInZone(midPoint, zone),
      );

      let segmentFare = segmentDistance * this.BASE_RATE_PER_KM;

      if (activeZone) {
        this.logger.log(
          `Segment of ${segmentDistance.toFixed(2)}km is in surge zone '${activeZone.id}'. Applying x${activeZone.multiplier} multiplier.`,
        );
        segmentFare *= activeZone.multiplier;
      }

      totalFare += segmentFare;
    }

    this.logger.log(`Total trip distance: ${totalDistance.toFixed(2)}km. Final Fare: KES ${totalFare.toFixed(2)}`);
    return { totalFare, totalDistance };
  }

  // Simple check to see if a point is within a rectangular zone
  private isPointInZone(point: Point, zone: SurgeZone): boolean {
    return (
      point.lat >= zone.bounds.minLat &&
      point.lat <= zone.bounds.maxLat &&
      point.lon >= zone.bounds.minLon &&
      point.lon <= zone.bounds.maxLon
    );
  }

  // Haversine formula approximation for distance calculation
  private calculateDistance(point1: Point, point2: Point): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
    const dLon = (point2.lon - point1.lon) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(point1.lat * (Math.PI / 180)) * Math.cos(point2.lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}