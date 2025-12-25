import { NextResponse } from 'next/server';

/**
 * API Route to finalize the driver application.
 * This acts as a secure proxy to the User & MLM Service.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { nationalIdNumber, licenseNumber, vehicleDetails, documents } = body;

  if (!nationalIdNumber || !licenseNumber || !vehicleDetails || !documents) {
    return NextResponse.json({ message: 'Missing required application data.' }, { status: 400 });
  }

  // In a real app, this would make a secure, server-to-server call
  // to the User & MLM Service to update the DriverProfile and User status.
  console.log('Forwarding final application details to User & MLM Service...');
  console.log('Data:', JSON.stringify(body, null, 2));
  // const backendResponse = await fetch('http://user-service/drivers/submit-documents', { ... });

  // The backend would then:
  // 1. Save the data to the DriverProfile model.
  // 2. Update the User status to 'PENDING_APPROVAL'.
  // 3. Publish a 'DriverApplicationSubmitted' event.

  return NextResponse.json({ message: 'Application submitted successfully.' }, { status: 200 });
}