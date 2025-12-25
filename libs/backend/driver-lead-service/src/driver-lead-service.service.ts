import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverLeadService {
  // Handles web-based driver registration and lead capture.

  private leads: any[] = []; // In-memory storage for prototype

  async registerDriver(data: any) {
    console.log('Registering driver lead:', data);

    // Check if email or phone already exists
    const existing = this.leads.find(l => l.email === data.email || l.phone === data.phone);
    if (existing) {
      throw new Error('User with this email or phone already exists.');
    }

    const newLead = {
      id: 'lead-' + Date.now(),
      ...data,
      status: 'PROSPECT',
      createdAt: new Date().toISOString()
    };

    this.leads.push(newLead);

    // In a real app, this would:
    // 1. Call User Service to create a user account
    // 2. Call MLM Service to link referrer
    // 3. Send confirmation email

    return {
      userId: newLead.id,
      message: 'Driver registration successful. Please check your email for next steps.'
    };
  }
}
