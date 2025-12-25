import { Injectable } from '@nestjs/common';

@Injectable()
export class RestaurantService {
  getPlaceholder(): string {
    return 'This is a placeholder for the restaurant service.';
  }
}