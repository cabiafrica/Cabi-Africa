import { Controller, Post, Body, Req } from '@nestjs/common';
import { SafetyService } from './safety.service';

class SosSignalDto {
  tripId: string;
  location: { lat: number; lon: number };
}

interface MockRequest {
  user?: { id: string; role: string };
}

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post('sos')
  triggerSos(@Body() sosSignalDto: SosSignalDto, @Req() req: MockRequest) {
    const user = req.user || { id: 'user-unknown', role: 'unknown' }; // Mock user
    return this.safetyService.handleSosSignal(user.id, user.role, sosSignalDto);
  }
}