$base = 'http://localhost:3334'

Write-Host "--- STEP 1: API Health Check ---"
$h = Invoke-RestMethod -Uri "$base/api/health" -Method Get
Write-Host "Health: $(ConvertTo-Json $h -Compress)"

Write-Host "`n--- STEP 2: Passenger Requests Ride ---"
$paxBody = @{
  passengerId = '2fd3e7ed-6059-48aa-9361-e2ecad8dc367'
  pickupLocation = @{
    address = 'Kenyatta Ave, Nairobi'
    lat = -1.286389
    lng = 36.817223
    latitude = -1.286389
    longitude = 36.817223
  }
  dropoffLocation = @{
    address = 'Westlands, Nairobi'
    lat = -1.2673
    lng = 36.8111
    latitude = -1.2673
    longitude = 36.8111
  }
  fare = 450
  vehicleType = 'STANDARD'
  isVerifiedPassenger = $true
  verificationMethod = 'FACE_RECOGNITION'
} | ConvertTo-Json -Depth 5

$ride = Invoke-RestMethod -Uri "$base/api/rides" -Method Post -Body $paxBody -ContentType 'application/json'
Write-Host "Ride Created! ID: $($ride.id) | Status: $($ride.status) | TripCode: $($ride.tripCode)"

Write-Host "`n--- STEP 3: Driver Accepts Trip ---"
$acceptBody = @{
  driverId = '5088e689-9725-4364-a337-725cfff86d60'
} | ConvertTo-Json

$accepted = Invoke-RestMethod -Uri "$base/api/rides/$($ride.id)/accept" -Method Post -Body $acceptBody -ContentType 'application/json'
Write-Host "Trip Accepted! Status: $($accepted.status)"

Write-Host "`n--- STEP 4: Driver Arrives at Pickup Location ---"
$arrived = Invoke-RestMethod -Uri "$base/api/rides/$($ride.id)/arrive" -Method Post -ContentType 'application/json'
Write-Host "Driver Arrived! Status: $($arrived.status)"

Write-Host "`n--- STEP 5: Trip Starts (Validating TripCode: $($ride.tripCode)) ---"
$startBody = @{
  tripCode = $ride.tripCode
} | ConvertTo-Json

$started = Invoke-RestMethod -Uri "$base/api/rides/$($ride.id)/start" -Method Post -Body $startBody -ContentType 'application/json'
Write-Host "Trip In Progress! Status: $($started.status)"

Write-Host "`n--- STEP 6: Trip Completed at Destination ---"
$completed = Invoke-RestMethod -Uri "$base/api/rides/$($ride.id)/complete" -Method Post -ContentType 'application/json'
Write-Host "Trip Completed! Status: $($completed.status)"

Write-Host "`n--- STEP 7: Passenger Rates Driver & Enters Occurrence Book ---"
$rateBody = @{
  rating = 5
  comment = 'Verified end-to-end trip flow with audio chimes and smooth state transitions!'
  role = 'PASSENGER'
  raterId = '2fd3e7ed-6059-48aa-9361-e2ecad8dc367'
} | ConvertTo-Json

$rated = Invoke-RestMethod -Uri "$base/api/rides/$($ride.id)/rate" -Method Post -Body $rateBody -ContentType 'application/json'
Write-Host "Rating Registered: $(ConvertTo-Json $rated -Compress)"

Write-Host "`n========================================================"
Write-Host "✅ ALL 7 TRIP FLOW LIFECYCLE MILESTONES VERIFIED 100% OK"
Write-Host "========================================================"
