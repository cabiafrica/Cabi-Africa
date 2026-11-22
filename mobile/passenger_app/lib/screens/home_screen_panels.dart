part of 'home_screen.dart';

extension _HomeScreenPanels on _HomeScreenState {
  Widget _buildDriverArrivingPanel(Color primaryColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelBg = isDark ? AppTheme.surfaceContainer : Colors.white;
    final panelBorder = isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline;
    final headlineColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subColor = isDark ? AppTheme.warmStone : AppTheme.porcelainTextSecondary;
    final goldAccent = isDark ? AppTheme.primaryLight : AppTheme.aurumBronze;
    final timePillBg = isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainSurfaceContainer;
    final successGreen = isDark ? AppTheme.successGreen : const Color(0xFF059669);
    final securityPin = (_currentRideData?['securityPin'] ?? _currentRideData?['tripCode'] ?? '----').toString();

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: panelBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: panelBorder, width: 1),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
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
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: successGreen),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _currentRideData?['status'] == 'DRIVER_ARRIVED'
                          ? "Waiting at pickup • 3m free grace period"
                          : "Arriving in $_arrivalDurationMinutes mins",
                      style: TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 14, color: headlineColor),
                    ),
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: AppTheme.goldGradient,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        "PIN $securityPin",
                        style: AppTheme.inter(
                          color: const Color(0xFF241A00),
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.6,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: timePillBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: panelBorder, width: 0.8),
                      ),
                      child: Text(
                        _currentRideData?['status'] == 'DRIVER_ARRIVED'
                            ? "ARRIVED"
                            : "$_arrivalDurationMinutes:00",
                        style: TextStyle(
                            color: goldAccent,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
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
                  color: goldAccent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: goldAccent, width: 1.2),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.qr_code_2_rounded, color: goldAccent, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          "TRIP CODE: ${_currentRideData!['tripCode']}",
                          style: TextStyle(
                            color: goldAccent,
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
                        color: isDark ? Colors.black45 : AppTheme.porcelainSurfaceHigh,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        "SHARE PIN",
                        style: TextStyle(color: subColor, fontSize: 9, fontWeight: FontWeight.bold),
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
                  color: goldAccent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: goldAccent.withValues(alpha: 0.35)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: goldAccent, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Driver is traveling from outside their zone. Standard fare applies (0 extra fees). Please stay in contact.',
                        style: TextStyle(
                          color: goldAccent,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            Divider(height: 24, color: isDark ? Colors.white24 : AppTheme.porcelainOutline),

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
                      driverMap?['licenseNumber'] ??
                      'Assigned')
                  .toString();
              final vehicleColor = (vehicleMap?['color'] ?? 'Verified').toString();
              final vehicleModel = (vehicleMap?['model'] ?? 'Captain Vehicle').toString();

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
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: headlineColor,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.star, color: Colors.amber, size: 14),
                            Text(
                              " ${_currentRideData?['driver']?['rating'] ?? '4.9'}",
                              style: TextStyle(
                                color: subColor,
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
                                color: goldAccent.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: goldAccent.withValues(alpha: 0.5),
                                  width: 0.8,
                                ),
                              ),
                              child: Text(
                                vehiclePlate,
                                style: TextStyle(
                                  color: goldAccent,
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
                                style: TextStyle(
                                  color: subColor,
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
                        color: isDark ? Colors.grey[900] : AppTheme.porcelainSurfaceContainer, shape: BoxShape.circle),
                    child: IconButton(
                        icon: Icon(Icons.phone, color: successGreen, size: 18),
                        tooltip: 'Call Captain (VoIP)',
                        onPressed: () {
                          InAppCallModal.show(
                            context,
                            peerName: driverPreferredName,
                            peerRole: 'DRIVER',
                            peerVehicle: '$vehiclePlate ($vehicleColor $vehicleModel)',
                            peerAvatar: driverPhoto,
                            isIncoming: false,
                          );
                          TripCommunicationService.instance.startCall();
                        }),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    decoration: BoxDecoration(
                        color: isDark ? Colors.grey[900] : AppTheme.porcelainSurfaceContainer, shape: BoxShape.circle),
                    child: IconButton(
                        icon: Icon(Icons.message, color: isDark ? Colors.blueAccent : const Color(0xFF0260C4), size: 18),
                        tooltip: 'Message Captain',
                        onPressed: () {
                          TripChatModal.show(
                            context,
                            peerName: driverPreferredName,
                            peerRole: 'DRIVER',
                            peerVehicle: '$vehiclePlate ($vehicleColor $vehicleModel)',
                            peerAvatar: driverPhoto,
                          );
                        }),
                  ),
                ],
              );
            }(),

            const SizedBox(height: 10),

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

  void _showRequestForSomeoneSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final nameController = TextEditingController(text: _recipientName);
    final phoneController = TextEditingController(text: _recipientPhone);
    final notesController = TextEditingController(text: _recipientNotes);
    String? validationError;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceContainer : Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  border: Border.all(
                    color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Drag handle
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.white24 : Colors.black12,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),

                      // Title row
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.person_add_alt_1_rounded,
                              color: AppTheme.primaryColor,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Request for Someone Else',
                                  style: AppTheme.inter(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w800,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                                Text(
                                  'Driver will coordinate pickup with this passenger',
                                  style: AppTheme.inter(
                                    fontSize: 11.5,
                                    color: isDark ? AppTheme.warmStone : Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 20),
                            onPressed: () => Navigator.pop(bottomSheetContext),
                          ),
                        ],
                      ),

                      const SizedBox(height: 18),

                      // Step 1: Requesting Person Identity Verification Badge
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF10B981).withValues(alpha: 0.4),
                            width: 1.2,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.verified_user_rounded,
                                color: Color(0xFF10B981),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        'Booker Verified',
                                        style: AppTheme.inter(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w700,
                                          color: isDark ? Colors.white : Colors.black87,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981).withValues(alpha: 0.18),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'ID VERIFIED',
                                          style: AppTheme.inter(
                                            fontSize: 8.5,
                                            fontWeight: FontWeight.w800,
                                            color: const Color(0xFF10B981),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Your account is authorized to book on behalf of others. Trip updates are shared via SMS.',
                                    style: AppTheme.inter(
                                      fontSize: 10.5,
                                      color: isDark ? AppTheme.warmStone : Colors.black54,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Step 2: Passenger Details
                      Text(
                        'PASSENGER BEING PICKED UP',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: isDark ? AppTheme.warmStone : Colors.black54,
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Passenger Name Input
                      TextField(
                        controller: nameController,
                        style: AppTheme.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Passenger Full Name *',
                          hintText: 'e.g. Grace Wanjiku',
                          prefixIcon: const Icon(Icons.person_outline_rounded, size: 20),
                          filled: true,
                          fillColor: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Passenger Phone Input
                      TextField(
                        controller: phoneController,
                        keyboardType: TextInputType.phone,
                        style: AppTheme.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Passenger Phone Number *',
                          hintText: '0712 345 678',
                          prefixIcon: const Icon(Icons.phone_outlined, size: 20),
                          prefixText: '+254 ',
                          prefixStyle: AppTheme.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                          filled: true,
                          fillColor: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Optional Note for Driver
                      TextField(
                        controller: notesController,
                        style: AppTheme.inter(
                          fontSize: 13,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Note for Driver (Optional)',
                          hintText: 'e.g. Waiting at Gate 2 in black coat',
                          prefixIcon: const Icon(Icons.chat_bubble_outline_rounded, size: 19),
                          filled: true,
                          fillColor: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),

                      if (validationError != null) ...[
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: const Color(0xFFEF4444).withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  validationError!,
                                  style: AppTheme.inter(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFFEF4444),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 20),

                      // Confirm Passenger Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            gradient: AppTheme.goldGradient,
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryColor.withValues(alpha: 0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: () {
                              final name = nameController.text.trim();
                              final phone = phoneController.text.trim();
                              if (name.isEmpty) {
                                setSheetState(() {
                                  validationError = "Please enter the passenger's name.";
                                });
                                return;
                              }
                              if (phone.isEmpty || phone.length < 8) {
                                setSheetState(() {
                                  validationError = "Please enter a valid phone number for the passenger.";
                                });
                                return;
                              }

                              _updateState(() {
                                _recipientName = name;
                                _recipientPhone = phone;
                                _recipientNotes = notesController.text.trim();
                                _isForSomeone = true;
                              });

                              Navigator.pop(bottomSheetContext);

                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Requesting ride for $name • SMS tracking will be sent'),
                                  backgroundColor: const Color(0xFF10B981),
                                  duration: const Duration(seconds: 3),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              foregroundColor: const Color(0xFF241A00),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 0,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.check_circle_rounded, size: 18, color: Color(0xFF241A00)),
                                const SizedBox(width: 8),
                                Text(
                                  'Confirm Passenger Details',
                                  style: AppTheme.montserrat(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF241A00),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildTripInProgressPanel(Color primaryColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelBg = isDark ? const Color(0xFF212121) : Colors.white;
    final panelBorder = isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline;
    final headlineColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subColor = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final goldAccent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final successGreen = isDark ? Colors.greenAccent : const Color(0xFF059669);
    final timePillBg = isDark ? const Color.fromARGB(255, 66, 66, 66) : AppTheme.porcelainSurfaceContainer;

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
          color: panelBg,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: panelBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
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
                                    ? successGreen
                                    : headlineColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 16),
                          ),
                          Text(
                            '$vehiclePlate ($vehicleColor $vehicleModel) • To: $_destination',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: subColor, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: timePillBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        formattedTime,
                        style: TextStyle(
                            color: goldAccent, fontWeight: FontWeight.bold),
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
                  color: goldAccent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: goldAccent, width: 1.2),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.qr_code_2_rounded, color: goldAccent, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          "TRIP CODE: ${_currentRideData!['tripCode']}",
                          style: TextStyle(
                            color: goldAccent,
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
                        color: isDark ? Colors.black45 : AppTheme.porcelainSurfaceHigh,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        "ACTIVE TRIP PIN",
                        style: TextStyle(color: subColor, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            Divider(color: isDark ? Colors.white24 : AppTheme.porcelainOutline, height: 24),

            // Live Fare Display
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Current Fare',
                  style: TextStyle(color: subColor, fontSize: 14),
                ),
                Text(
                  'KES ${_currentFare.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: goldAccent,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

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
                      foregroundColor: headlineColor,
                      side: BorderSide(color: isDark ? Colors.white30 : AppTheme.porcelainOutline),
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
                      backgroundColor: goldAccent,
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
      initialChildSize: 0.68,
      minChildSize: 0.25,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceContainer : surfaceColor.withValues(alpha: 0.98),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            border: Border.all(color: (isDark ? AppTheme.outlineGold : dividerColor).withValues(alpha: 0.20), width: 0.8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.65 : 0.12),
                blurRadius: 32,
                offset: const Offset(0, -6),
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
                      // 0. Stitch Top Controls: For Me / For Someone & Leave Now
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: isDark ? AppTheme.surfaceDim : const Color(0xFFF0EDEC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: (isDark ? AppTheme.outlineBorder : dividerColor).withValues(alpha: 0.20), width: 0.8),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.05),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                GestureDetector(
                                  onTap: () => _updateState(() => _isForSomeone = false),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      gradient: !_isForSomeone ? AppTheme.goldGradient : null,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      "For Me",
                                      style: AppTheme.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: !_isForSomeone ? const Color(0xFF241A00) : (isDark ? AppTheme.warmStone : Colors.black54),
                                      ),
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: _showRequestForSomeoneSheet,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      gradient: _isForSomeone ? AppTheme.goldGradient : null,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          _isForSomeone && _recipientName.isNotEmpty
                                              ? "For ${_recipientName.split(' ').first}"
                                              : "For Someone",
                                          style: AppTheme.inter(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: _isForSomeone ? const Color(0xFF241A00) : (isDark ? AppTheme.warmStone : Colors.black54),
                                          ),
                                        ),
                                        if (_isForSomeone) ...[
                                          const SizedBox(width: 4),
                                          const Icon(
                                            Icons.edit_rounded,
                                            size: 11,
                                            color: Color(0xFF241A00),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const ScheduledRidesScreen()),
                              );
                            },
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                              decoration: BoxDecoration(
                                color: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF6F3F2),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: (isDark ? AppTheme.outlineGold : dividerColor).withValues(alpha: 0.20), width: 0.8),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.05),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.schedule_rounded, size: 14, color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze),
                                  const SizedBox(width: 5),
                                  Text(
                                    "Leave now",
                                    style: AppTheme.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(width: 2),
                                  Icon(Icons.expand_more_rounded, size: 15, color: isDark ? AppTheme.warmStone : Colors.black54),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // E2E Simulation Action Bar
                      Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton.icon(
                          onPressed: () => startAutoE2ESimulation(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? AppTheme.primaryColor : const Color(0xFFD4AF37),
                            foregroundColor: const Color(0xFF1E1602),
                            elevation: 3,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: const Icon(Icons.play_circle_fill_rounded, size: 22, color: Color(0xFF1E1602)),
                          label: Text(
                            "Simulate End-to-End Trip Process",
                            style: AppTheme.inter(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: const Color(0xFF1E1602),
                            ),
                          ),
                        ),
                      ),

                      // 1. Lustre Platinum Location Pickers (Pickup, Swap, Optional Stop, Destination)
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.surfaceContainer : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: (isDark ? AppTheme.outlineGold : dividerColor).withValues(alpha: 0.20),
                            width: 0.8,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: isDark ? 0.45 : 0.08),
                              blurRadius: 20,
                              spreadRadius: 1,
                              offset: const Offset(0, 6),
                            )
                          ],
                        ),
                        child: Column(
                          children: [
                            Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Column(
                                  children: [
                                    // Pickup Card Row
                                    InkWell(
                                      onTap: () => _navigateToSearch(isPickup: true),
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                        decoration: BoxDecoration(
                                          color: isDark ? AppTheme.obsidianCanvas : const Color(0xFFF6F3F2),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(
                                            color: (isDark ? AppTheme.outlineGold : dividerColor).withValues(alpha: 0.20),
                                            width: 0.8,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 26,
                                              height: 26,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: AppTheme.successGreen.withValues(alpha: 0.16),
                                                border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.45)),
                                              ),
                                              child: const Icon(
                                                Icons.radio_button_checked_rounded,
                                                size: 14,
                                                color: AppTheme.successGreen,
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    "PICKUP LOCATION",
                                                    style: AppTheme.inter(
                                                      fontSize: 9,
                                                      fontWeight: FontWeight.w700,
                                                      letterSpacing: 0.8,
                                                      color: isDark ? AppTheme.warmStone : AppTheme.porcelainTextSecondary,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 1),
                                                  Text(
                                                    _pickupAddress,
                                                    style: AppTheme.inter(
                                                      fontSize: 13.5,
                                                      fontWeight: FontWeight.w600,
                                                      color: isDark ? Colors.white : Colors.black87,
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  if (_isLoadingLocation)
                                                    Text(
                                                      "Detecting location...",
                                                      style: AppTheme.inter(
                                                        fontSize: 10,
                                                        color: AppTheme.primaryLight,
                                                        fontWeight: FontWeight.w600,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                            ),
                                            IconButton(
                                              icon: Icon(
                                                Icons.pin_drop_outlined,
                                                size: 17,
                                                color: isDark ? AppTheme.warmStone : Colors.black54,
                                              ),
                                              tooltip: "Select pickup on map",
                                              onPressed: () => _navigateToSearch(isPickup: true),
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                            ),
                                            IconButton(
                                              icon: Icon(
                                                Icons.my_location_rounded,
                                                size: 17,
                                                color: _isLoadingLocation
                                                    ? AppTheme.primaryLight
                                                    : (isDark ? AppTheme.primaryLight : AppTheme.aurumBronze),
                                              ),
                                              tooltip: "Auto-detect location",
                                              onPressed: () => _initLocationTracking(userInitiated: true),
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 8),

                                    // Optional Intermediate Stop Row
                                    if (_intermediateStop != null) ...[
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                        decoration: BoxDecoration(
                                          color: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF6F3F2),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: AppTheme.outlineGold.withValues(alpha: 0.20), width: 0.8),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.04),
                                              blurRadius: 6,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(Icons.pause_circle_outline_rounded,
                                                size: 16,
                                                color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Text(
                                                _intermediateStop!,
                                                style: AppTheme.inter(
                                                  fontSize: 12.5,
                                                  fontWeight: FontWeight.w600,
                                                  color: isDark ? Colors.white : Colors.black87,
                                                ),
                                              ),
                                            ),
                                            InkWell(
                                              onTap: () => _updateState(() => _intermediateStop = null),
                                              child: Icon(Icons.close_rounded,
                                                  size: 16,
                                                  color: isDark ? AppTheme.warmStone : Colors.black54),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                    ],

                                    // Destination Card Row
                                    InkWell(
                                      onTap: () => _navigateToSearch(isPickup: false),
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                        decoration: BoxDecoration(
                                          color: isDark ? AppTheme.obsidianCanvas : const Color(0xFFF6F3F2),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(
                                            color: (isDark ? AppTheme.outlineGold : dividerColor).withValues(alpha: 0.20),
                                            width: 0.8,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 26,
                                              height: 26,
                                              decoration: const BoxDecoration(
                                                shape: BoxShape.circle,
                                                gradient: AppTheme.goldGradient,
                                              ),
                                              child: const Icon(
                                                Icons.location_on_rounded,
                                                size: 15,
                                                color: Color(0xFF241A00),
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    "WHERE TO?",
                                                    style: AppTheme.inter(
                                                      fontSize: 9,
                                                      fontWeight: FontWeight.w800,
                                                      letterSpacing: 0.8,
                                                      color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 1),
                                                  Text(
                                                    _destination,
                                                    style: AppTheme.inter(
                                                      fontSize: 13.5,
                                                      fontWeight: FontWeight.w700,
                                                      color: isDark ? Colors.white : Colors.black87,
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                            ),
                                            InkWell(
                                              onTap: () {
                                                _updateState(() {
                                                  _intermediateStop = _intermediateStop == null
                                                      ? "Stop: Sarit Centre Gate B"
                                                      : null;
                                                });
                                              },
                                              borderRadius: BorderRadius.circular(6),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: isDark ? AppTheme.surfaceContainerHigh : Colors.white,
                                                  borderRadius: BorderRadius.circular(6),
                                                  border: Border.all(color: AppTheme.outlineGold.withValues(alpha: 0.20), width: 0.8),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.05),
                                                      blurRadius: 4,
                                                      offset: const Offset(0, 1),
                                                    ),
                                                  ],
                                                ),
                                                child: Text(
                                                  _intermediateStop == null ? "+ Stop" : "− Stop",
                                                  style: AppTheme.inter(
                                                    fontSize: 10.5,
                                                    fontWeight: FontWeight.w700,
                                                    color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            Icon(
                                              Icons.map_outlined,
                                              size: 18,
                                              color: isDark ? AppTheme.warmStone : Colors.black54,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                // Swap Pickup / Destination floating pill on right
                                Positioned(
                                  right: 4,
                                  top: 24,
                                  child: InkWell(
                                    onTap: _swapLocations,
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      width: 28,
                                      height: 28,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isDark ? AppTheme.surfaceContainer : Colors.white,
                                        border: Border.all(color: AppTheme.outlineGold.withValues(alpha: 0.20), width: 0.8),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: isDark ? 0.40 : 0.15),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        Icons.swap_vert_rounded,
                                        size: 16,
                                        color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Quick Location Shortcuts
                            Row(
                              children: [
                                _buildLocationShortcut(
                                  icon: Icons.home_rounded,
                                  label: "Home",
                                  isDark: isDark,
                                  onTap: () {
                                    _navigateToSearch(isPickup: false);
                                  },
                                ),
                                const SizedBox(width: 8),
                                _buildLocationShortcut(
                                  icon: Icons.business_rounded,
                                  label: "Office",
                                  isDark: isDark,
                                  onTap: () {
                                    _navigateToSearch(isPickup: false);
                                  },
                                ),
                                const SizedBox(width: 8),
                                _buildLocationShortcut(
                                  icon: Icons.flight_rounded,
                                  label: "JKIA Airport",
                                  isDark: isDark,
                                  onTap: () {
                                    _updateState(() {
                                      _destination = "JKIA Terminal 1A";
                                    });
                                    _navigateToSearch(isPickup: false);
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Stitch 2x2 Available Fleets Grid
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "AVAILABLE FLEETS",
                            style: AppTheme.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.0,
                              color: isDark ? AppTheme.warmStone : Colors.black54,
                            ),
                          ),
                          Text(
                            "Tap fleet to choose destination",
                            style: AppTheme.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _buildStitchFleetCard(
                            title: 'CabiGo',
                            subtitle: 'Standard • 3 mins',
                            tag: 'Affordable',
                            icon: Icons.directions_car_rounded,
                            accentColor: const Color(0xFFE5A93C),
                            isDark: isDark,
                            isSelected: (_selectedVehicleId ?? 'standard') == 'standard',
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                            onTap: () {
                              _updateState(() {
                                _selectedVehicleId = 'standard';
                                _selectedVehicleType = 'STANDARD';
                              });
                              _navigateToSearch(isPickup: false);
                            },
                          ),
                          const SizedBox(width: 10),
                          _buildStitchFleetCard(
                            title: 'CabiX Comfort',
                            subtitle: 'Executive sedan',
                            tag: 'Executive',
                            icon: Icons.airline_seat_recline_extra_rounded,
                            accentColor: const Color(0xFF0284C7),
                            isDark: isDark,
                            isSelected: _selectedVehicleId == 'comfort',
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                            onTap: () {
                              _updateState(() {
                                _selectedVehicleId = 'comfort';
                                _selectedVehicleType = 'COMFORT';
                              });
                              _navigateToSearch(isPickup: false);
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _buildStitchFleetCard(
                            title: 'Cabi Lux',
                            subtitle: 'VIP Black Series',
                            tag: 'VIP Captain',
                            icon: Icons.local_taxi_rounded,
                            accentColor: const Color(0xFFD4AF37),
                            isDark: isDark,
                            isSelected: _selectedVehicleId == 'lux',
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                            onTap: () {
                              _updateState(() {
                                _selectedVehicleId = 'lux';
                                _selectedVehicleType = 'LUX';
                              });
                              _navigateToSearch(isPickup: false);
                            },
                          ),
                          const SizedBox(width: 10),
                          _buildStitchFleetCard(
                            title: 'Cabi Boda',
                            subtitle: 'Fastest city beat',
                            tag: 'Speedy',
                            icon: Icons.two_wheeler_rounded,
                            accentColor: const Color(0xFF10B981),
                            isDark: isDark,
                            isSelected: _selectedVehicleId == 'boda',
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                            onTap: () {
                              _updateState(() {
                                _selectedVehicleId = 'boda';
                                _selectedVehicleType = 'BODA';
                              });
                              _navigateToSearch(isPickup: false);
                            },
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // ── Services Section Header ──
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "MORE SERVICES",
                            style: AppTheme.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                              color: isDark ? AppTheme.warmStone : Colors.black54,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: primaryColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              "On-Demand",
                              style: AppTheme.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: primaryColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // ── Food & Package Delivery Bento Row ──
                      Row(
                        children: [
                          // 1. Food Delivery Card
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
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: isDark
                                        ? [
                                            const Color(0xFF28140B),
                                            const Color(0xFF191614),
                                          ]
                                        : [
                                            const Color(0xFFFFF7ED),
                                            const Color(0xFFFFEDD5),
                                          ],
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: const Color(0xFFEA580C)
                                        .withValues(alpha: isDark ? 0.15 : 0.22),
                                    width: 0.8,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFEA580C).withValues(
                                          alpha: isDark ? 0.08 : 0.06),
                                      blurRadius: 18,
                                      offset: const Offset(0, 6),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Top Row: Tag + Arrow
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 3.5),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFEA580C)
                                                .withValues(
                                                    alpha: isDark ? 0.2 : 0.15),
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            '20-30 MIN',
                                            style: AppTheme.inter(
                                              fontSize: 9.5,
                                              fontWeight: FontWeight.w800,
                                              letterSpacing: 0.5,
                                              color: const Color(0xFFEA580C),
                                            ),
                                          ),
                                        ),
                                        Container(
                                          width: 24,
                                          height: 24,
                                          decoration: BoxDecoration(
                                            color: isDark
                                                ? Colors.white10
                                                : Colors.black
                                                    .withValues(alpha: 0.05),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.arrow_forward_rounded,
                                            size: 13,
                                            color: Color(0xFFEA580C),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 14),

                                    // Glowing Culinary Icon
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEA580C)
                                            .withValues(alpha: 0.18),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                          color: const Color(0xFFEA580C)
                                              .withValues(alpha: 0.4),
                                          width: 1,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFFEA580C)
                                                .withValues(alpha: 0.25),
                                            blurRadius: 12,
                                            offset: const Offset(0, 3),
                                          )
                                        ],
                                      ),
                                      child: const Icon(
                                        Icons.restaurant_rounded,
                                        color: Color(0xFFEA580C),
                                        size: 24,
                                      ),
                                    ),
                                    const SizedBox(height: 14),

                                    // Title & Tagline
                                    Text(
                                      'Food Delivery',
                                      style: AppTheme.outfit(
                                        color: onSurfaceColor,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.3,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Order meals & snacks',
                                      style: AppTheme.inter(
                                        color: isDark
                                            ? AppTheme.warmStone
                                            : Colors.black54,
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 14),

                                    // Mini Action Pill
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 7),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEA580C)
                                            .withValues(
                                                alpha: isDark ? 0.16 : 0.12),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: const Color(0xFFEA580C)
                                              .withValues(alpha: 0.3),
                                        ),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        'Explore Menu →',
                                        style: AppTheme.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: const Color(0xFFEA580C),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),

                          // 2. Package Delivery Card
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
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: isDark
                                        ? [
                                            const Color(0xFF0F2420),
                                            const Color(0xFF12161A),
                                          ]
                                        : [
                                            const Color(0xFFF0FDFA),
                                            const Color(0xFFCCFBF1),
                                          ],
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: (isDark ? const Color(0xFF2DD4BF) : const Color(0xFF0D9488))
                                        .withValues(alpha: isDark ? 0.15 : 0.18),
                                    width: 0.8,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF0D9488).withValues(
                                          alpha: isDark ? 0.08 : 0.06),
                                      blurRadius: 18,
                                      offset: const Offset(0, 6),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Top Row: Tag + Arrow
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 3.5),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0D9488)
                                                .withValues(
                                                    alpha: isDark ? 0.2 : 0.12),
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            'DOORSTEP',
                                            style: AppTheme.inter(
                                              fontSize: 9.5,
                                              fontWeight: FontWeight.w800,
                                              letterSpacing: 0.5,
                                              color: isDark
                                                  ? const Color(0xFF2DD4BF)
                                                  : const Color(0xFF0D9488),
                                            ),
                                          ),
                                        ),
                                        Container(
                                          width: 24,
                                          height: 24,
                                          decoration: BoxDecoration(
                                            color: isDark
                                                ? Colors.white10
                                                : Colors.black
                                                    .withValues(alpha: 0.05),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(
                                            Icons.arrow_forward_rounded,
                                            size: 13,
                                            color: isDark
                                                ? const Color(0xFF2DD4BF)
                                                : const Color(0xFF0D9488),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 14),

                                    // Glowing Courier Icon
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0D9488)
                                            .withValues(alpha: 0.18),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                          color: isDark
                                              ? const Color(0xFF2DD4BF)
                                                  .withValues(alpha: 0.4)
                                              : const Color(0xFF0D9488)
                                                  .withValues(alpha: 0.35),
                                          width: 1,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFF0D9488)
                                                .withValues(alpha: 0.25),
                                            blurRadius: 12,
                                            offset: const Offset(0, 3),
                                          )
                                        ],
                                      ),
                                      child: Icon(
                                        Icons.inventory_2_rounded,
                                        color: isDark
                                            ? const Color(0xFF2DD4BF)
                                            : const Color(0xFF0D9488),
                                        size: 24,
                                      ),
                                    ),
                                    const SizedBox(height: 14),

                                    // Title & Tagline
                                    Text(
                                      'Send Packages',
                                      style: AppTheme.outfit(
                                        color: onSurfaceColor,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.3,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Fast parcel delivery',
                                      style: AppTheme.inter(
                                        color: isDark
                                            ? AppTheme.warmStone
                                            : Colors.black54,
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 14),

                                    // Mini Action Pill
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 7),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0D9488)
                                            .withValues(
                                                alpha: isDark ? 0.16 : 0.1),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: isDark
                                              ? const Color(0xFF2DD4BF)
                                                  .withValues(alpha: 0.3)
                                              : const Color(0xFF0D9488)
                                                  .withValues(alpha: 0.25),
                                        ),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        'Dispatch Now →',
                                        style: AppTheme.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: isDark
                                              ? const Color(0xFF2DD4BF)
                                              : const Color(0xFF0D9488),
                                        ),
                                      ),
                                    ),
                                  ],
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

                      const SizedBox(height: 24),

                      // Stitch Concierge & Specialized 4-Column Strip
                      Text(
                        "CONCIERGE & SPECIALIZED",
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.0,
                          color: isDark ? AppTheme.warmStone : Colors.black54,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _buildStitchConciergeCard(
                            icon: Icons.schedule_rounded,
                            title: 'Hourly Hire',
                            subtitle: '800/- hr',
                            isDark: isDark,
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                          ),
                          const SizedBox(width: 8),
                          _buildStitchConciergeCard(
                            icon: Icons.flight_takeoff_rounded,
                            title: 'Airport VIP',
                            subtitle: 'Terminal 1A',
                            isDark: isDark,
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                          ),
                          const SizedBox(width: 8),
                          _buildStitchConciergeCard(
                            icon: Icons.inventory_2_rounded,
                            title: 'Cabi Parcel',
                            subtitle: 'Live courier',
                            isDark: isDark,
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                          ),
                          const SizedBox(width: 8),
                          _buildStitchConciergeCard(
                            icon: Icons.calendar_month_rounded,
                            title: 'Reserve',
                            subtitle: 'Pre-schedule',
                            isDark: isDark,
                            onSurfaceColor: onSurfaceColor,
                            dividerColor: dividerColor,
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Stitch Promotional Card: Cabi Executive Pass
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: isDark
                              ? const LinearGradient(
                                  colors: [Color(0xFF2B230B), Color(0xFF1C1B1B), Color(0xFF3B2E08)],
                                )
                              : AppTheme.goldGradient,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppTheme.outlineGold),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'PLATINUM PRIVILEGE',
                                    style: AppTheme.inter(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.0,
                                      color: isDark ? AppTheme.lustreGold : const Color(0xFF241A00),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Cabi Executive Pass',
                                    style: AppTheme.inter(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: isDark ? Colors.white : const Color(0xFF241A00),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Save 15% on your next 5 rides with priority dispatch.',
                                    style: AppTheme.inter(
                                      fontSize: 12,
                                      color: isDark ? AppTheme.warmStone : const Color(0xFF3A2B00),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isDark ? AppTheme.lustreGold : const Color(0xFF1C1B1B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                'Activate',
                                style: AppTheme.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: isDark ? const Color(0xFF241A00) : AppTheme.lustreGold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 28),

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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final vehicleName = _selectedVehicleType ?? 'Standard Ride';
    final panelBg = (isDark ? const Color(0xFF0F172A) : Colors.white).withValues(alpha: 0.92);
    final panelBorder = isDark ? Colors.white.withValues(alpha: 0.12) : AppTheme.porcelainOutline;
    final handleColor = isDark ? Colors.white.withValues(alpha: 0.35) : AppTheme.porcelainOutline;
    final headlineColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subColor = isDark ? Colors.white.withValues(alpha: 0.70) : AppTheme.porcelainTextSecondary;

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
                color: panelBg,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(
                  color: panelBorder,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
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
                          color: handleColor,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),

            Text(
              "Finding your driver...",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: headlineColor,
                letterSpacing: 0.3,
              ),
            ),
                    const SizedBox(height: 4),
                    Text(
                      "Scanning nearby drivers for $vehicleName",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: subColor,
                      ),
                    ),
                    const SizedBox(height: 16),

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
                          color: subColor,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          "Free cancellation within 3 mins of driver arrival",
                          style: TextStyle(
                            fontSize: 12,
                            color: subColor,
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
                        color: subColor.withValues(alpha: 0.7),
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

    final isDark = Theme.of(context).brightness == Brightness.dark;
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
                backgroundColor: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF1F5F9),
                backgroundImage: authState is Authenticated ? getPassengerAvatarProvider(authState.user) : null,
                child: (authState is! Authenticated || getPassengerAvatarProvider(authState.user) == null)
                    ? Icon(Icons.person_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 32)
                    : null,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final containerColor = isDark ? AppTheme.surfaceContainer : Colors.white;
    final outlineColor = isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline;
    final textHeadlineColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSubColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    int calcApproxPrice(String vehicleId) {
      const Map<String, Map<String, double>> pricing = {
        'boda': {'base': 50, 'perKm': 20},
        'standard': {'base': 150, 'perKm': 40},
        'comfort': {'base': 180, 'perKm': 45},
        'lux': {'base': 250, 'perKm': 65},
        'lite': {'base': 100, 'perKm': 30},
        'xl': {'base': 200, 'perKm': 60},
      };
      final p = pricing[vehicleId] ?? {'base': 150.0, 'perKm': 40.0};
      final dist = _distanceKm > 0 ? _distanceKm : 5.0;
      final price = (p['base']! + dist * p['perKm']!).round();
      return ((price + 5) ~/ 10) * 10;
    }

    final selectedId = _selectedVehicleId ?? 'standard';
    final selectedVehicle = _vehicleTypes.firstWhere(
      (v) => v['id'] == selectedId,
      orElse: () => _vehicleTypes[1],
    );
    final selectedTierName = selectedVehicle['name'] as String;
    final Color selectedFleetColor = (selectedVehicle['color'] as Color?) ?? AppTheme.primaryColor;
    final bool isDarkText = selectedFleetColor.computeLuminance() > 0.45;
    final Color buttonTextColor = isDarkText ? const Color(0xFF241A00) : Colors.white;
    final approxPrice = calcApproxPrice(selectedId);

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: BoxDecoration(
          color: containerColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: outlineColor, width: 1.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.08),
              blurRadius: 32,
              spreadRadius: isDark ? 8 : 2,
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
                color: isDark ? Colors.white24 : Colors.black12,
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
                                color: textHeadlineColor,
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
                            color: textSubColor,
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
                      color: isDark ? AppTheme.electricBlueContainer : const Color(0x180260C4),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline, width: 0.8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.speed_rounded, color: isDark ? AppTheme.electricBlue : AppTheme.royalBlue, size: 13),
                        const SizedBox(width: 4),
                        Text(
                          'Traffic Clear',
                          style: AppTheme.inter(
                            color: isDark ? AppTheme.electricBlue : AppTheme.royalBlue,
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
                        color: isDark ? AppTheme.surfaceBright : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
                      ),
                      child: Icon(Icons.close, color: isDark ? Colors.white70 : Colors.black87, size: 18),
                    ),
                  ),
                ],
              ),
            ),

            Divider(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline, height: 1),
            const SizedBox(height: 8),

            // Service List (Bento Stack)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: _vehicleTypes.map((v) {
                  final id = v['id'] as String;
                  final isSelected = id == (_selectedVehicleId ?? 'standard');
                  final Color fleetColor = (v['color'] as Color?) ?? AppTheme.primaryColor;
                  final String tag = (v['tag'] as String?) ?? 'Available';
                  return GestureDetector(
                    onTap: () {
                      _updateState(() {
                        _selectedVehicleId = id;
                        switch (id) {
                          case 'boda':
                            _selectedVehicleType = 'BODA';
                            break;
                          case 'standard':
                            _selectedVehicleType = 'STANDARD';
                            break;
                          case 'comfort':
                            _selectedVehicleType = 'COMFORT';
                            break;
                          case 'lux':
                            _selectedVehicleType = 'LUX';
                            break;
                          case 'lite':
                            _selectedVehicleType = 'LITE';
                            break;
                          case 'xl':
                            _selectedVehicleType = 'XL';
                            break;
                          default:
                            _selectedVehicleType = 'STANDARD';
                        }
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? fleetColor.withValues(alpha: isDark ? 0.22 : 0.12)
                            : (isDark ? AppTheme.surfaceContainerHigh : Colors.white),
                        border: Border.all(
                          color: isSelected
                              ? fleetColor
                              : fleetColor.withValues(alpha: isDark ? 0.40 : 0.25),
                          width: isSelected ? 2.0 : 1.0,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: fleetColor.withValues(
                                alpha: isSelected ? (isDark ? 0.35 : 0.20) : (isDark ? 0.08 : 0.04)),
                            blurRadius: isSelected ? 12 : 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          // Vector car/boda icon color-coded
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: fleetColor.withValues(alpha: isSelected ? 0.28 : 0.14),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: fleetColor.withValues(alpha: isSelected ? 0.6 : 0.28),
                                width: 1.0,
                              ),
                            ),
                            child: Icon(
                              v['icon'] as IconData,
                              color: fleetColor,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),

                          // Tier Name + Category Pill + ETA + Capacity
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      v['name'] as String,
                                      style: AppTheme.inter(
                                        color: isDark ? Colors.white : Colors.black87,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: fleetColor.withValues(alpha: isSelected ? 0.22 : 0.12),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: fleetColor.withValues(alpha: isSelected ? 0.5 : 0.25),
                                          width: 0.8,
                                        ),
                                      ),
                                      child: Text(
                                        tag.toUpperCase(),
                                        style: AppTheme.inter(
                                          color: fleetColor,
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.4,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Text(
                                      '${v['time']} away • Dropoff in 25 min',
                                      style: AppTheme.inter(
                                        color: isDark ? AppTheme.warmStone : Colors.black54,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Icon(
                                      Icons.person,
                                      size: 13,
                                      color: isDark ? Colors.white38 : Colors.black38,
                                    ),
                                    Text(
                                      id == 'boda'
                                          ? '1'
                                          : (v['capacity'] as String)
                                              .replaceAll('4 Pax', '4')
                                              .replaceAll('6-8 Pax', '7'),
                                      style: AppTheme.inter(
                                        color: isDark ? Colors.white38 : Colors.black45,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Approximate Price & Selection Indicator
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '≈ Ksh. ${calcApproxPrice(id)}/-',
                                style: AppTheme.inter(
                                  color: isSelected
                                      ? (isDark ? Colors.white : Colors.black87)
                                      : (isDark ? Colors.white70 : Colors.black87),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14.5,
                                  letterSpacing: -0.2,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'approx.',
                                    style: AppTheme.inter(
                                      color: isDark ? AppTheme.warmStone : Colors.black45,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    width: 18,
                                    height: 18,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isSelected ? fleetColor : Colors.transparent,
                                      border: Border.all(
                                        color: isSelected
                                            ? fleetColor
                                            : (isDark ? Colors.white24 : Colors.black26),
                                        width: 1.5,
                                      ),
                                    ),
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check,
                                            size: 12,
                                            color: Colors.white,
                                          )
                                        : null,
                                  ),
                                ],
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

            const SizedBox(height: 12),

            // Recipient Details Banner (when booking for someone else)
            if (_isForSomeone) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GestureDetector(
                  onTap: _showRequestForSomeoneSheet,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: isDark ? 0.16 : 0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFF10B981).withValues(alpha: 0.35),
                        width: 1.0,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.person_pin_circle_rounded,
                            color: Color(0xFF10B981),
                            size: 16,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _recipientName.isNotEmpty
                                    ? 'Passenger: $_recipientName (+254 $_recipientPhone)'
                                    : 'Tap to enter passenger details *',
                                style: AppTheme.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              Text(
                                _recipientName.isNotEmpty
                                    ? 'Driver coordinates with passenger • Verified booker'
                                    : 'Passenger name & phone number required for pickup',
                                style: AppTheme.inter(
                                  fontSize: 10,
                                  color: isDark ? AppTheme.warmStone : Colors.black54,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.surfaceContainerHigh : Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            _recipientName.isNotEmpty ? 'Edit' : 'Add Details',
                            style: AppTheme.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF10B981),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),
            ],

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
                      borderRadius: BorderRadius.circular(14),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          selectedFleetColor,
                          HSLColor.fromColor(selectedFleetColor)
                              .withLightness((HSLColor.fromColor(selectedFleetColor).lightness - 0.08).clamp(0.0, 1.0))
                              .toColor(),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: selectedFleetColor.withValues(alpha: isDark ? 0.38 : 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        if (_isForSomeone && _recipientName.isEmpty) {
                          _showRequestForSomeoneSheet();
                        } else {
                          _startSearchSimulation();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        foregroundColor: buttonTextColor,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Confirm $selectedTierName',
                              style: AppTheme.montserrat(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                                color: buttonTextColor,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                              decoration: BoxDecoration(
                                color: buttonTextColor.withValues(alpha: 0.16),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '≈ Ksh. $approxPrice/-',
                                style: AppTheme.montserrat(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.2,
                                  color: buttonTextColor,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(Icons.arrow_forward_rounded, color: buttonTextColor, size: 19),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Approx. fare ≈ Ksh. $approxPrice/- • Free cancellation within 3 mins',
                    style: AppTheme.plusJakartaSans(
                      color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
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
            color: (Theme.of(context).brightness == Brightness.dark
                ? AppTheme.darkSurface
                : AppTheme.porcelainSurface)
                .withValues(alpha: 0.97),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
                color: Theme.of(context).brightness == Brightness.dark
                    ? primaryColor.withValues(alpha: 0.4)
                    : AppTheme.porcelainOutline,
                width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(
                    alpha: Theme.of(context).brightness == Brightness.dark ? 0.5 : 0.12),
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
                    Text(
                      'FULL SCREEN MAP',
                      style: TextStyle(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.grey
                            : AppTheme.porcelainTextSecondary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      statusText,
                      style: TextStyle(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.white
                            : AppTheme.porcelainTextPrimary,
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


  Widget _buildLocationShortcut({
    required IconData icon,
    required String label,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF2F4F7),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: (isDark ? AppTheme.outlineBorder : const Color(0xFFE5E7EB)).withValues(alpha: 0.20), width: 0.8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.04),
                blurRadius: 5,
                offset: const Offset(0, 1.5),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 13, color: AppTheme.primaryColor),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  style: AppTheme.plusJakartaSans(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildStitchConciergeCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
    required Color onSurfaceColor,
    required Color dividerColor,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceContainerHigh : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? AppTheme.outlineBorder : dividerColor),
        ),
        child: Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 17, color: AppTheme.primaryColor),
            ),
            const SizedBox(height: 6),
            Text(
              title,
              style: AppTheme.inter(
                fontSize: 10.5,
                fontWeight: FontWeight.w700,
                color: onSurfaceColor,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
            Text(
              subtitle,
              style: AppTheme.inter(
                fontSize: 9,
                color: isDark ? AppTheme.warmStone : Colors.black54,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildStitchFleetCard({
    required String title,
    required String subtitle,
    required String tag,
    required IconData icon,
    required Color accentColor,
    required bool isDark,
    required Color onSurfaceColor,
    required Color dividerColor,
    bool isSelected = false,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isSelected
                ? accentColor.withValues(alpha: isDark ? 0.22 : 0.12)
                : (isDark ? AppTheme.surfaceContainerHigh : Colors.white),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? accentColor
                  : accentColor.withValues(alpha: isDark ? 0.20 : 0.15),
              width: isSelected ? 1.6 : 0.8,
            ),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? accentColor.withValues(alpha: isDark ? 0.35 : 0.22)
                    : Colors.black.withValues(alpha: isDark ? 0.20 : 0.05),
                blurRadius: isSelected ? 14 : 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: AppTheme.inter(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                            color: onSurfaceColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          subtitle,
                          style: AppTheme.inter(
                            fontSize: 10,
                            color: isDark ? AppTheme.warmStone : Colors.black54,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: accentColor.withValues(alpha: isSelected ? 0.28 : 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      icon,
                      size: 20,
                      color: accentColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: accentColor.withValues(alpha: isSelected ? 0.25 : 0.12),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: accentColor.withValues(alpha: isSelected ? 0.6 : 0.3),
                        width: 0.8,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(
                            color: accentColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          tag,
                          style: AppTheme.inter(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            color: accentColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isSelected)
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: accentColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 10,
                        color: Colors.white,
                      ),
                    )
                  else
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 11,
                      color: isDark ? Colors.white30 : Colors.black26,
                    ),
                ],
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
