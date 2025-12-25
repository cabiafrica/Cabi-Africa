import { POST } from './route';

describe('POST /api/submit-driver-documents', () => {
  it('should return 200 on successful submission with valid data', async () => {
    const request = new Request('http://localhost/api/submit-driver-documents', {
      method: 'POST',
      body: JSON.stringify({
        nationalIdNumber: '12345',
        licenseNumber: 'DL123',
        vehicleDetails: { make: 'Toyota', model: 'Vitz', year: '2018', plate: 'KDA 123X' },
        documents: [{ type: 'national-id', key: 'key1' }],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Application submitted successfully.');
  });

  it('should return 400 if required data is missing', async () => {
    const request = new Request('http://localhost/api/submit-driver-documents', {
      method: 'POST',
      body: JSON.stringify({ nationalIdNumber: '12345' }), // Missing other fields
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});