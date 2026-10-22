part of 'home_screen.dart';

extension _HomeScreenPanels on _HomeScreenState {
  Widget _buildDriverArrivingPanel(Color primaryColor) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1), width: 1),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 20,
                spreadRadius: 5),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _currentRideData?['status'] == 'DRIVER_ARRIVED'
                          ? "Driver has arrived!"
                          : "Driver found!",
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.greenAccent),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _currentRideData?['status'] == 'DRIVER_ARRIVED'
                          ? "Waiting at pickup • 3m free grace period"
                          : "Arriving in $_arrivalDurationMinutes mins",
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 14, color: Colors.white),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _currentRideData?['status'] == 'DRIVER_ARRIVED'
                        ? "ARRIVED"
                        : "$_arrivalDurationMinutes:00",
                    style: const TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.bold),
                  ),
                )
              ],
            ),
            if (_currentRideData?['status'] == 'DRIVER_ARRIVED') ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.amber.withValues(alpha: 0.5)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.timer_outlined, color: Colors.amber, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        "Driver is at pickup point. Free cancellation within 3 mins. Wait fee applies thereafter and is charged on your next ride.",
                        style: TextStyle(color: Colors.amber, fontSize: 11.5, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (_currentRideData?['tripCode'] != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.qr_code_2_rounded, color: Color(0xFFD4AF37), size: 20),
                        const SizedBox(width: 8),
                        Text(
                          "TRIP CODE: ${_currentRideData!['tripCode']}",
                          style: const TextStyle(
                            color: Color(0xFFD4AF37),
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black45,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        "SHARE PIN",
                        style: TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (_currentRideData?['isExtendedPickup'] == true || _arrivalDurationMinutes > 10) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.35)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: Color(0xFFD4AF37), size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Driver is traveling from outside their zone. Standard fare applies (0 extra fees). Please stay in contact.',
                        style: TextStyle(
                          color: Color(0xFFD4AF37),
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const Divider(height: 24),

            // Driver Info
            () {
              final driverMap = _currentRideData?['driver'] as Map<String, dynamic>?;
              final driverUser = driverMap?['user'] as Map<String, dynamic>?;
              final driverPreferredName = (driverMap?['preferredPublicName'] ??
                      driverMap?['nickname'] ??
                      driverUser?['nickname'] ??
                      driverUser?['fullName'] ??
                      driverMap?['fullName'] ??
                      'Driver Found')
                  .toString();
              final driverPhoto = (driverMap?['profilePicture'] ??
                      driverUser?['passportPhotoUrl'])
                  ?.toString();
              final vehicleMap = driverMap?['vehicle'] as Map<String, dynamic>?;
              final vehiclePlate = (vehicleMap?['licensePlate'] ??
                      vehicleMap?['plateNumber'] ??
                      'KCZ 123A')
                  .toString();
              final vehicleColor = (vehicleMap?['color'] ?? 'Silver').toString();
              final vehicleModel = (vehicleMap?['model'] ?? 'Toyota Axio').toString();

              return Row(
                children: [
                  ProfileAvatarBadge(
                    imageUrl: driverPhoto,
                    name: driverPreferredName,
                    radius: 25,
                    borderColor: AppTheme.primaryColor,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                driverPreferredName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.star, color: Colors.amber, size: 14),
                            Text(
                              " ${_currentRideData?['driver']?['rating'] ?? '4.9'}",
                              style: const TextStyle(
                                color: Colors.white70,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD4AF37).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: const Color(0xFFD4AF37).withOpacity(0.5),
                                  width: 0.8,
                                ),
                              ),
                              child: Text(
                                vehiclePlate,
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                "$vehicleColor • $vehicleModel",
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Call / Message Actions
                  Container(
                    decoration: BoxDecoration(
                        color: Colors.grey[900], shape: BoxShape.circle),
                    child: IconButton(
                        icon: const Icon(Icons.phone, color: Colors.greenAccent, size: 18),
                        onPressed: () {}),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    decoration: BoxDecoration(
                        color: Colors.grey[900], shape: BoxShape.circle),
                    child: IconButton(
                        icon: const Icon(Icons.message, color: Colors.blueAccent, size: 18),
                        onPressed: () {}),
                  ),
                ],
              );
            }(),

            const SizedBox(height: 20),

            // Cancel Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: _isCancelling ? null : _cancelRideSearch,
                style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.redAccent,
                    side: const BorderSide(color: Colors.redAccent, width: 1.2),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                child: _isCancelling
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.redAccent),
                        ),
                      )
                    : const Text(
                        "Cancel Ride",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTripInProgressPanel(Color primaryColor) {
    String formattedTime =
        "${(_tripDurationSeconds ~/ 60).toString().padLeft(2, '0')}:${(_tripDurationSeconds % 60).toString().padLeft(2, '0')}";

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF212121), // Dark Premium Background
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Driver/Trip Header
            Builder(
              builder: (context) {
                final driverMap = _currentRideData?['driver'] as Map<String, dynamic>?;
                final driverUser = driverMap?['user'] as Map<String, dynamic>?;
                final driverPreferredName = (driverMap?['preferredPublicName'] ??
                        driverMap?['nickname'] ??
                        driverUser?['nickname'] ??
                        driverUser?['fullName'] ??
                        driverMap?['fullName'] ??
                        'Driver')
                    .toString();
                final driverPhoto = (driverMap?['profilePicture'] ??
                        driverUser?['passportPhotoUrl'])
                    ?.toString();
                final vehicleMap = driverMap?['vehicle'] as Map<String, dynamic>?;
                final vehiclePlate = (vehicleMap?['licensePlate'] ??
                        vehicleMap?['plateNumber'] ??
                        'KCZ 123A')
                    .toString();
                final vehicleColor = (vehicleMap?['color'] ?? 'Silver').toString();
                final vehicleModel = (vehicleMap?['model'] ?? 'Toyota Axio').toString();

                return Row(
                  children: [
                    ProfileAvatarBadge(
                      imageUrl: driverPhoto,
                      name: driverPreferredName,
                      radius: 20,
                      borderColor: AppTheme.primaryColor,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _tripStatus == TripStatus.arrived
                                ? 'Arrived at Destination'
                                : 'On Trip with $driverPreferredName',
                            style: TextStyle(
                                color: _tripStatus == TripStatus.arrived
                                    ? Colors.greenAccent
                                    : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16),
                          ),
                          Text(
                            '$vehiclePlate ($vehicleColor $vehicleModel) • To: $_destination',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color.fromARGB(255, 66, 66, 66),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        formattedTime,
                        style: const TextStyle(
                            color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                );
              },
            ),
            if (_currentRideData?['tripCode'] != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.qr_code_2_rounded, color: Color(0xFFD4AF37), size: 20),
                        const SizedBox(width: 8),
                        Text(
                          "TRIP CODE: ${_currentRideData!['tripCode']}",
                          style: const TextStyle(
                            color: Color(0xFFD4AF37),
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black45,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        "ACTIVE TRIP PIN",
                        style: TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const Divider(color: Colors.white24, height: 24),

            // Live Fare Display
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Current Fare',
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                ),
                Text(
                  'KES ${_currentFare.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: AppTheme.primaryColor, // Taxi Gold
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Estimated Waybill...')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white30),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Waybill'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () {
                      // Share trip logic
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Share Trip Status',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingSheet(Color primaryColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = Theme.of(context).colorScheme.surface;
    final onSurfaceColor = Theme.of(context).colorScheme.onSurface;
    final dividerColor = Theme.of(context).dividerColor;

    return DraggableScrollableSheet(
      initialChildSize: 0.95,
      minChildSize: 0.25,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceContainer : surfaceColor.withValues(alpha: 0.98),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            border: Border.all(color: isDark ? AppTheme.outlineGold : dividerColor, width: 1.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.1),
                blurRadius: 28,
                offset: const Offset(0, -4),
              )
            ],
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle
                Center(
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 16),
                    width: 48,
                    height: 5,
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.outlineBorder : Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Location Pickers (Pickup & Destination)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.surfaceDim : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isDark ? AppTheme.outlineBorder : dividerColor,
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            )
                          ]
                        ),
                        child: Column(
                          children: [
                            // Pickup
                            InkWell(
                              onTap: () => _navigateToSearch(isPickup: true),
                              child: Row(
                                children: [
                                  Container(
                                    width: 12,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(color: AppTheme.electricBlue, width: 2.5),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _pickupAddress,
                                          style: AppTheme.outfit(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w500,
                                              color: isDark ? Colors.white70 : Colors.black87),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        if (_isLoadingLocation)
                                          Text(
                                            "Detecting location...",
                                            style: AppTheme.outfit(
                                              fontSize: 11,
                                              color: AppTheme.primaryColor,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: Icon(
                                      Icons.my_location_rounded,
                                      size: 18,
                                      color: _isLoadingLocation
                                          ? AppTheme.primaryColor
                                          : (isDark ? Colors.white60 : Colors.black54),
                                    ),
                                    tooltip: "Auto-detect location",
                                    onPressed: () => _initLocationTracking(userInitiated: true),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(left: 5, top: 4, bottom: 4),
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Container(
                                  width: 2,
                                  height: 20,
                                  color: dividerColor,
                                ),
                              ),
                            ),
                            // Destination
                            InkWell(
                              onTap: () => _navigateToSearch(isPickup: false),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF2F4F7),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isDark ? AppTheme.outlineGold : const Color(0xFFD0D5DD),
                                    width: 1.2,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 12,
                                      height: 12,
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryColor,
                                        borderRadius: BorderRadius.circular(3),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Text(
                                        _destination,
                                        style: AppTheme.outfit(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: isDark ? Colors.white : Colors.black87),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Icon(
                                      Icons.search_rounded,
                                      size: 20,
                                      color: isDark ? AppTheme.primaryColor : Colors.black54,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),

                      // ── Tours & Travel CTA Button ──
                      GestureDetector(
                        onTap: () async {
                          final uri = Uri.parse('https://tours.cabiafrica.com');
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri,
                                mode: LaunchMode.externalApplication);
                          }
                        },
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            image: const DecorationImage(
                              image: AssetImage('assets/images/tours_bg.png'),
                              fit: BoxFit.cover,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.2),
                                blurRadius: 15,
                                offset: const Offset(0, 8),
                              )
                            ],
                          ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 24),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  Colors.black.withValues(alpha: 0.8),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: primaryColor,
                                    borderRadius: BorderRadius.circular(14),
                                    boxShadow: [
                                      BoxShadow(
                                        color: primaryColor.withValues(alpha: 0.4),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      )
                                    ]
                                  ),
                                  child: const Icon(
                                    Icons.explore_rounded,
                                    color: Colors.black,
                                    size: 28,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Tours & Travel',
                                        style: AppTheme.outfit(
                                          color: Colors.white,
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Book trips, safaris & adventures',
                                        style: AppTheme.outfit(
                                          color: Colors.white
                                              .withValues(alpha: 0.9),
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.25),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.arrow_forward_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // ── Food & Package Delivery Row ──
                      Row(
                        children: [
                          // Food Delivery
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const FoodCheckoutScreen()),
                                );
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  image: const DecorationImage(
                                    image: AssetImage('assets/images/food_bg.png'),
                                    fit: BoxFit.cover,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.15),
                                      blurRadius: 12,
                                      offset: const Offset(0, 6),
                                    )
                                  ],
                                ),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    gradient: LinearGradient(
                                      begin: Alignment.bottomCenter,
                                      end: Alignment.topCenter,
                                      colors: [
                                        Colors.black.withValues(alpha: 0.7),
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: primaryColor,
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Icon(
                                          Icons.fastfood_rounded,
                                          color: Colors.black,
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(height: 32),
                                      Text(
                                        'Food Delivery',
                                        style: AppTheme.outfit(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Order meals',
                                        style: AppTheme.outfit(
                                          color: Colors.white
                                              .withValues(alpha: 0.85),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Package Delivery
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const DeliveryScreen()),
                                );
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  image: const DecorationImage(
                                    image: AssetImage('assets/images/package_bg.png'),
                                    fit: BoxFit.cover,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.15),
                                      blurRadius: 12,
                                      offset: const Offset(0, 6),
                                    )
                                  ],
                                ),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    gradient: LinearGradient(
                                      begin: Alignment.bottomCenter,
                                      end: Alignment.topCenter,
                                      colors: [
                                        Colors.black.withValues(alpha: 0.7),
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: primaryColor,
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Icon(
                                          Icons.inventory_2_rounded,
                                          color: Colors.black,
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(height: 32),
                                      Text(
                                        'Packages',
                                        style: AppTheme.outfit(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Send parcels',
                                        style: AppTheme.outfit(
                                          color: Colors.white
                                              .withValues(alpha: 0.85),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),
                      
                      // Favourite Places Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Favourites",
                              style: AppTheme.outfit(
                                  fontWeight: FontWeight.bold, fontSize: 20, color: onSurfaceColor)),
                          TextButton(
                            onPressed: () {},
                            child: Text("See all",
                                style: AppTheme.outfit(color: primaryColor, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 110,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _favouriteDestinations.length,
                          itemBuilder: (context, index) {
                            final item = _favouriteDestinations[index];
                            return Container(
                              width: 150,
                              margin: const EdgeInsets.only(right: 16, bottom: 8, top: 4),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1F1F1F) : Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: dividerColor),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  )
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(item['icon'], color: primaryColor, size: 24),
                                  const Spacer(),
                                  Text(item['name'],
                                      style: AppTheme.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                          color: onSurfaceColor)),
                                  Text(item['address'],
                                      style: AppTheme.outfit(
                                          color: isDark ? Colors.grey[400] : Colors.grey[600], fontSize: 12),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            );
                          },
                        ),
                      ),

                      // Recent Places
                      const SizedBox(height: 32),
                      Text("Recent Places",
                          style: AppTheme.outfit(
                              fontWeight: FontWeight.bold, fontSize: 20, color: onSurfaceColor)),
                      const SizedBox(height: 16),
                      ..._recentPlaces.map((place) => Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: dividerColor)
                              ),
                              tileColor: isDark ? const Color(0xFF1F1F1F) : Colors.white,
                              leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: primaryColor.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(place['icon'], color: primaryColor),
                              ),
                              title: Text(place['name'],
                                  style: AppTheme.outfit(
                                      fontWeight: FontWeight.w600, color: onSurfaceColor, fontSize: 16)),
                              subtitle: Text(place['address'], style: AppTheme.outfit(color: isDark ? Colors.grey[400] : Colors.grey[600])),
                              onTap: () {
                                _updateState(() {
                                  _destination = place['name'];
                                });
                              },
                            ),
                      )),

                      const SizedBox(height: 32),

                      // 3. Discover More
                      Text("Discover More",
                          style: AppTheme.outfit(
                              fontWeight: FontWeight.bold, fontSize: 20, color: onSurfaceColor)),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                const PromotionalCarousel(),
                const SizedBox(height: 32),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchingPanel(Color primaryColor) {
    final vehicleName = _selectedVehicleType ?? 'Standard Ride';

    return DraggableScrollableSheet(
      initialChildSize: 0.30,
      minChildSize: 0.12,
      maxChildSize: 0.40,
      snap: true,
      snapSizes: const [0.12, 0.30],
      builder: (context, scrollController) {
        return ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 18.0, sigmaY: 18.0),
            child: Container(
              decoration: BoxDecoration(
                // 20% transparent background (80% opacity)
                color: const Color(0xFF0F172A).withValues(alpha: 0.80),
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.12),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.35),
                    blurRadius: 24,
                    spreadRadius: 4,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SingleChildScrollView(
                controller: scrollController,
                physics: const ClampingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Top Drag Handle (Allows swiping downwards to peek map or upwards)
                    Center(
                      child: Container(
                        width: 44,
                        height: 5,
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.35),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),

            const Text(
              "Finding your driver...",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 0.3,
              ),
            ),
                    const SizedBox(height: 4),
                    Text(
                      "Scanning nearby drivers for $vehicleName",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.70),
                      ),
                    ),
                    const SizedBox(height: 16),

            // Wave Countdown Badge (Auto-restarts when it hits 00:00)



            // Cancel Search & Change Service Button
                    // Action Button: 'Cancel Ride' with Integrated Wave Countdown
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isCancelling ? null : _cancelRideSearch,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEF4444),
                          foregroundColor: Colors.white,
                          elevation: 3,
                          shadowColor: const Color(0xFFEF4444).withValues(alpha: 0.35),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: _isCancelling
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.close_rounded,
                                      size: 20, color: Colors.white),
                                  const SizedBox(width: 8),
                                  const Text(
                                    "Cancel Ride",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                      letterSpacing: 0.4,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 9, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.25),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      "00:${_searchCountdownSeconds.toString().padLeft(2, '0')}",
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Information Note: Free Cancellation Policy
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.info_outline_rounded,
                          size: 14,
                          color: Colors.white.withValues(alpha: 0.65),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          "Free cancellation within 3 mins of driver arrival",
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.65),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),

                    Text(
                      "Need a faster pickup? Tap above to switch vehicle tier",
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withValues(alpha: 0.45),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDrawer() {
    final authState = ref.watch(passengerAuthProvider);
    String userName = "Guest";
    String userEmail = "";

    if (authState is Authenticated) {
      userName = authState.user?['firstName'] != null
          ? "${authState.user!['firstName']} ${authState.user!['lastName'] ?? ''}"
          : authState.user?['name'] ?? 'User';
      userEmail = authState.user?['email'] ?? "";
    }

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                  colors: [AppTheme.primaryColor, AppTheme.secondaryAmber]),
            ),
            accountName: Text(userName,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.black)),
            accountEmail: Text(userEmail,
                style: const TextStyle(color: Colors.black87)),
            currentAccountPicture: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.black87, width: 2),
                boxShadow: const [
                  BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 2)),
                ],
              ),
              child: CircleAvatar(
                backgroundColor: const Color(0xFF1E1E1E),
                backgroundImage: () {
                  final authState = ref.watch(passengerAuthProvider);
                  if (authState is Authenticated) {
                    return getPassengerAvatarProvider(authState.user);
                  }
                  return const AssetImage('assets/images/passenger_avatar.jpg') as ImageProvider;
                }(),
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('My Trips'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const RideHistoryScreen())),
          ),
          ListTile(
            leading: const Icon(Icons.payment),
            title: const Text('Wallet & Payment'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const WalletScreen())),
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Settings'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('Help & Support'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const HelpCenterScreen())),
          ),
        ],
      ),
    );
  }

  // ── Service Selection Panel (Stitch efbb07f42c3449fe9b5631158cb011bf) ──────
  Widget _buildServiceSelectionPanel(Color primaryColor) {
    // Pricing tables
    const Map<String, Map<String, double>> pricing = {
      'boda': {'base': 50, 'perKm': 20},
      'lite': {'base': 100, 'perKm': 35},
      'standard': {'base': 150, 'perKm': 45},
      'xl': {'base': 200, 'perKm': 55},
    };

    String calcPrice(String vehicleId) {
      final p = pricing[vehicleId] ?? {'base': 100.0, 'perKm': 35.0};
      final base = p['base']!;
      final perKm = p['perKm']!;
      final dist = _distanceKm > 0 ? _distanceKm : 5.0; // use 5 km if unknown
      final low = (base + dist * perKm).round();
      final high = (low * 1.15).round();
      return 'KES $low – $high';
    }

    // Vehicle feature subtitles matching Stitch design
    final Map<String, String> vehicleFeatures = {
      'boda': 'Fast urban bypass • Helmet provided',
      'lite': 'Daily commute • Economical',
      'standard': 'Comfort • A/C • Top Rated Chauffeur',
      'xl': 'Spacious 7 Pax • Extra Luggage capacity',
    };

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainer,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppTheme.outlineGold, width: 1.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.6),
              blurRadius: 32,
              spreadRadius: 8,
              offset: const Offset(0, -4),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Centered Drag Handle
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 48,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
            ),

            // Route Header Summary Banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppTheme.successGreen,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _distanceKm > 0
                                  ? '${(_distanceKm * 2.5).round()} min • Expressway'
                                  : '26 min • Expressway',
                              style: AppTheme.plusJakartaSans(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'To: $_destination',
                          style: AppTheme.plusJakartaSans(
                            color: Colors.white60,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  // Traffic status chip (Stitch pattern)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.electricBlueContainer,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.outlineGold, width: 0.8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.speed_rounded, color: AppTheme.electricBlue, size: 13),
                        const SizedBox(width: 4),
                        Text(
                          'Traffic Clear',
                          style: AppTheme.inter(
                            color: AppTheme.electricBlue,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Close / back to search
                  GestureDetector(
                    onTap: () => _updateState(() => _tripStatus = TripStatus.idle),
                    child: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceBright,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.outlineBorder),
                      ),
                      child: const Icon(Icons.close, color: Colors.white70, size: 18),
                    ),
                  ),
                ],
              ),
            ),

            const Divider(color: AppTheme.outlineBorder, height: 1),
            const SizedBox(height: 8),

            // Service List (Bento Stack)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: _vehicleTypes.map((v) {
                  final id = v['id'] as String;
                  final isSelected = id == (_selectedVehicleId ?? 'standard');
                  return GestureDetector(
                    onTap: () {
                      _updateState(() {
                        _selectedVehicleId = id;
                        switch (id) {
                          case 'lite':
                            _selectedVehicleType = 'LITE';
                            break;
                          case 'standard':
                            _selectedVehicleType = 'STANDARD';
                            break;
                          case 'xl':
                            _selectedVehicleType = 'XL';
                            break;
                          case 'boda':
                            _selectedVehicleType = 'BODA';
                            break;
                          default:
                            _selectedVehicleType = 'STANDARD';
                        }
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryContainer
                            : AppTheme.surfaceDim,
                        border: Border.all(
                          color: isSelected ? AppTheme.primaryColor : AppTheme.outlineBorder,
                          width: isSelected ? 1.8 : 1.0,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withValues(alpha: 0.22),
                                  blurRadius: 14,
                                  spreadRadius: 1,
                                ),
                              ]
                            : null,
                      ),
                      child: Row(
                        children: [
                          // Vehicle Silhouette / Icon Container
                          Container(
                            width: 50,
                            height: 50,
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppTheme.primaryColor.withValues(alpha: 0.18)
                                  : AppTheme.surfaceBright,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? AppTheme.primaryColor.withValues(alpha: 0.4)
                                    : AppTheme.outlineBorder,
                              ),
                            ),
                            child: Image.asset(
                              v['image'] as String,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Icon(
                                v['icon'] as IconData,
                                color: isSelected ? AppTheme.primaryColor : Colors.white60,
                                size: 26,
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),

                          // Name + Feature description + ETA
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      v['name'] as String,
                                      style: AppTheme.montserrat(
                                        color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.88),
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: AppTheme.surfaceBright,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.people_outline, size: 11, color: Colors.white60),
                                          const SizedBox(width: 3),
                                          Text(
                                            v['capacity'] as String,
                                            style: AppTheme.inter(
                                              color: Colors.white70,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  vehicleFeatures[id] ?? 'Reliable mobility',
                                  style: AppTheme.plusJakartaSans(
                                    color: isSelected ? Colors.white70 : Colors.white38,
                                    fontSize: 11.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 3),
                                Row(
                                  children: [
                                    const Icon(Icons.timer_outlined, size: 12, color: AppTheme.successGreen),
                                    const SizedBox(width: 4),
                                    Text(
                                      v['time'] as String,
                                      style: AppTheme.inter(
                                        color: AppTheme.successGreen,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Price & Status Badge
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                calcPrice(id),
                                style: AppTheme.montserrat(
                                  color: isSelected ? AppTheme.primaryColor : Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              if (isSelected)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                                  decoration: BoxDecoration(
                                    gradient: AppTheme.goldGradient,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    id == 'standard' ? 'BEST VALUE' : 'SELECTED',
                                    style: AppTheme.inter(
                                      fontSize: 9,
                                      color: Colors.black,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                )
                              else if (id == 'standard')
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceBright,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppTheme.outlineBorder),
                                  ),
                                  child: Text(
                                    'POPULAR',
                                    style: AppTheme.inter(
                                      fontSize: 9,
                                      color: Colors.white60,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 10),

            // M-Pesa & SACCO Verification Strip (Stitch Obsidian Gold)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceBright,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.outlineBorder),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.successGreen,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'M-Pesa Express (••• 456)',
                      style: AppTheme.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.electricBlueContainer,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified_user_rounded, color: AppTheme.electricBlue, size: 12),
                          const SizedBox(width: 4),
                          Text(
                            'SACCO Verified',
                            style: AppTheme.inter(
                              color: AppTheme.electricBlue,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Book Button with Metallic Gold Gradient
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: double.infinity,
                    height: 56,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      gradient: AppTheme.goldGradient,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.35),
                          blurRadius: 18,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: _startSearchSimulation,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Confirm ${_vehicleTypes.firstWhere((v) => v['id'] == (_selectedVehicleId ?? 'standard'), orElse: () => _vehicleTypes[1])['name']} • ${calcPrice(_selectedVehicleId ?? 'standard').split('–').first.trim()}',
                            style: AppTheme.montserrat(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.3,
                              color: Colors.black,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward_rounded, color: Colors.black, size: 20),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Guaranteed upfront fare • Free cancellation within 3 mins',
                    style: AppTheme.plusJakartaSans(
                      color: Colors.white38,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFullScreenFloatingBar(Color primaryColor) {
    String statusText;
    switch (_tripStatus) {
      case TripStatus.searching:
        statusText = 'Searching for nearby drivers...';
        break;
      case TripStatus.selectingService:
        statusText = 'Selecting ride service';
        break;
      case TripStatus.driverFound:
        statusText = 'Driver assigned • Arriving in $_arrivalDurationMinutes mins';
        break;
      case TripStatus.onTrip:
        statusText = 'Trip in progress';
        break;
      case TripStatus.arrived:
        statusText = 'Arrived at destination';
        break;
      case TripStatus.idle:
        statusText = _destination != 'Where to?' ? _destination : 'Tap to book a trip';
        break;
    }

    return Positioned(
      bottom: MediaQuery.of(context).padding.bottom + 16,
      left: 16,
      right: 16,
      child: GestureDetector(
        onTap: _exitFullScreenMap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          decoration: BoxDecoration(
            color: AppTheme.darkSurface.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: primaryColor.withValues(alpha: 0.4), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 18,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: primaryColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _tripStatus == TripStatus.searching
                      ? Icons.radar_rounded
                      : Icons.location_on_rounded,
                  color: primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FULL SCREEN MAP',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      statusText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: primaryColor,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.fullscreen_exit_rounded, color: Colors.black, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Restore',
                      style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SearchingRadarPulse extends StatefulWidget {
  final Color color;
  final double size;

  const SearchingRadarPulse({
    super.key,
    this.color = AppTheme.primaryColor,
    this.size = 80.0,
  });

  @override
  State<SearchingRadarPulse> createState() => _SearchingRadarPulseState();
}

class _SearchingRadarPulseState extends State<SearchingRadarPulse>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: [
              // Outer Ripple
              Transform.scale(
                scale: 1.0 + (_controller.value * 0.8),
                child: Container(
                  width: widget.size * 0.6,
                  height: widget.size * 0.6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: widget.color.withValues(
                          alpha: (1.0 - _controller.value) * 0.5),
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              // Inner Ripple
              Transform.scale(
                scale: 1.0 + (((_controller.value + 0.5) % 1.0) * 0.8),
                child: Container(
                  width: widget.size * 0.6,
                  height: widget.size * 0.6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: widget.color.withValues(
                          alpha: (1.0 - ((_controller.value + 0.5) % 1.0)) * 0.5),
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              // Glowing Central Radar Circle
              Container(
                width: widget.size * 0.55,
                height: widget.size * 0.55,
                decoration: BoxDecoration(
                  color: const Color(0xFF161616),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: widget.color.withValues(alpha: 0.8),
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: widget.color.withValues(alpha: 0.35),
                      blurRadius: 14,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Center(
                  child: RotationTransition(
                    turns: _controller,
                    child: Icon(
                      Icons.radar_rounded,
                      color: widget.color,
                      size: widget.size * 0.3,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
