// Mock data for a specific driver's documents
const driverDocuments = [
  { id: 'doc-1', type: 'Driver\'s License', status: 'Pending Review', fileUrl: '/mock-license.png' },
  { id: 'doc-2', type: 'Vehicle Insurance', status: 'Pending Review', fileUrl: '/mock-insurance.png' },
];

export default function DriverApprovalPage({ params }: { params: { driverId: string } }) {
  const { driverId } = params;

  const handleApprove = (docId: string) => {
    console.log(`Approving document ${docId} for driver ${driverId}`);
    // In a real app, this would call the backend API
  };

  const handleReject = (docId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      console.log(`Rejecting document ${docId} for driver ${driverId} with reason: ${reason}`);
      // In a real app, this would call the backend API
    }
  };

  return (
    <div>
      <h1>Reviewing Documents for Driver: {driverId}</h1>
      {driverDocuments.map((doc) => (
        <div key={doc.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{doc.type}</h3>
          <p>Status: {doc.status}</p>
          <img src={doc.fileUrl} alt={doc.type} width="300" />
          <div>
            <button onClick={() => handleApprove(doc.id)}>Approve</button>
            <button onClick={() => handleReject(doc.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}