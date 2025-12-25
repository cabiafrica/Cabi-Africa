'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type FileUpload = {
  file: File;
  key: string;
  url: string;
};

export default function UploadDocumentsPage() {
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [inspectionFile, setInspectionFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const filesToUpload = [
      { name: 'national-id', file: nationalIdFile },
      { name: 'drivers-license', file: licenseFile },
      { name: 'inspection-report', file: inspectionFile },
    ].filter(f => f.file) as { name: string; file: File }[];

    if (filesToUpload.length < 3) {
      setError('Please upload all required documents.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Get pre-signed URLs for all files
      setStatusMessage('Preparing secure upload links...');
      const filenames = filesToUpload.map(f => f.file.name);
      const presignedUrlResponse = await fetch('/api/get-upload-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames }),
      });

      if (!presignedUrlResponse.ok) throw new Error('Could not prepare uploads.');
      const uploadLinks: FileUpload[] = await presignedUrlResponse.json();

      // Step 2: Upload files directly to S3
      setStatusMessage('Uploading documents...');
      await Promise.all(
        uploadLinks.map(link =>
          fetch(link.url, {
            method: 'PUT',
            body: filesToUpload.find(f => f.file.name === link.file)?.file,
            headers: { 'Content-Type': filesToUpload.find(f => f.file.name === link.file)?.file.type || '' },
          })
        )
      );

      // Step 3: Submit form data and S3 keys to our backend
      setStatusMessage('Finalizing application...');
      const documentKeys = uploadLinks.map(link => ({ type: link.file, key: link.key }));
      const finalSubmissionResponse = await fetch('/api/submit-driver-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalIdNumber,
          licenseNumber,
          vehicleDetails: { make: vehicleMake, model: vehicleModel, year: vehicleYear, plate: licensePlate },
          documents: documentKeys,
        }),
      });

      if (!finalSubmissionResponse.ok) throw new Error('Failed to submit application.');

      setStatusMessage('Application submitted successfully! You will be notified once it has been reviewed.');
      // Redirect to a success/dashboard page after a delay
      setTimeout(() => router.push('/drivers/dashboard'), 3000);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Complete Your Application</h1>
      <p>Please provide your details and upload the required documents.</p>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <fieldset>
          <legend>Personal & Vehicle Details</legend>
          <input placeholder="National ID Number" value={nationalIdNumber} onChange={e => setNationalIdNumber(e.target.value)} required />
          <input placeholder="Driver's License Number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} required />
          <input placeholder="Vehicle Make" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} required />
          <input placeholder="Vehicle Model" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} required />
          <input placeholder="Vehicle Year" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} required />
          <input placeholder="License Plate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
        </fieldset>

        <fieldset>
          <legend>Document Uploads</legend>
          <div>
            <label>National ID</label>
            <input type="file" onChange={e => setNationalIdFile(e.target.files ? e.target.files[0] : null)} required />
          </div>
          <div>
            <label>Driver's License</label>
            <input type="file" onChange={e => setLicenseFile(e.target.files ? e.target.files[0] : null)} required />
          </div>
          <div>
            <label>Vehicle Inspection Report</label>
            <input type="file" onChange={e => setInspectionFile(e.target.files ? e.target.files[0] : null)} required />
          </div>
        </fieldset>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </button>

        {isLoading && statusMessage && <p>{statusMessage}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}