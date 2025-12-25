import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}