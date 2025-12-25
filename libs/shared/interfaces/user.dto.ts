export class DocumentDto {
  id: string;
  documentType: string; // e.g., 'license', 'insurance'
  status: 'Pending Review' | 'Approved' | 'Rejected';
  url: string;
  uploadedAt: string;
}

export class UserDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'Driver' | 'Passenger' | 'Admin';
  profilePictureUrl?: string;
  documents?: DocumentDto[];
}

export class UpdateUserProfileDto {
  fullName?: string;
  phoneNumber?: string;
}

export class ProfilePictureDto {
  userId: string;
  profilePictureUrl: string;
}