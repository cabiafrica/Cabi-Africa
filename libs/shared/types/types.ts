export interface AccountHistoryItem {
  date: string;
  action: 'SUSPENDED' | 'REACTIVATED';
  note: string;
}

export interface SuspendedAccount {
  userId: string;
  fullName: string;
  email: string;
  suspensionDate: string;
  suspensionReason: string;
  accountType: 'DRIVER' | 'PASSENGER';
  history?: AccountHistoryItem[];
}