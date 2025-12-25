import { Injectable } from '@nestjs/common';

@Injectable()
export class MapService {
  getPlaceholder(): string {
    return 'This is a placeholder for the map service.';
  }
}