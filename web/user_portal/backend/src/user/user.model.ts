// Mock representation of a user in the database

export interface BusinessProfile {
  workEmail?: string;
  defaultPaymentMethodId?: string;
  expenseCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  businessProfile?: BusinessProfile;
}