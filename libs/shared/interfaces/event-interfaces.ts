/**
 * Defines the structure for the event published when a new driver completes registration.
 */
export interface DriverRegisteredEvent {
  userId: string;
  email: string;
  fullName: string;
  referralCode?: string;
  registrationTimestamp: string;
}