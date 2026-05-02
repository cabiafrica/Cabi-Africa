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
                    const Text("Driver found!",
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Colors.greenAccent)),
                    const SizedBox(height: 4),
                    Text("Arriving in $_arrivalDurationMinutes mins",
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14, color: Colors.white)),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text("$_arrivalDurationMinutes:00",
                      style: const TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.bold)),
                )
              ],
            ),
            const Divider(height: 30),

            // Driver Info
            Row(
              children: [
                CircleAvatar(
                  radius: 25,
                  backgroundImage: _currentRideData?['driver']?['profilePicture'] != null
                      ? NetworkImage(_currentRideData!['driver']['profilePicture'])
                      : const NetworkImage('https://i.pravatar.cc/150?u=driver_default'),
                ),
                const SizedBox(width: 15),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_currentRideData?['driver']?['fullName'] ?? "Driver Found",
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        Text(" ${_currentRideData?['driver']?['rating'] ?? '4.9'} ",
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text("• ${_currentRideData?['driver']?['vehicle']?['licensePlate'] ?? 'KCZ 123A'} • ${_currentRideData?['driver']?['vehicle']?['model'] ?? 'Toyota Axio'}",
                            style: TextStyle(
                                color: Colors.white70, fontSize: 13)),
                      ],
                    )
                  ],
                ),
                const Spacer(),
                // Call / Message Actions
                Container(
                  decoration: BoxDecoration(
                      color: Colors.grey[100], shape: BoxShape.circle),
                  child: IconButton(
                      icon: const Icon(Icons.phone, color: Colors.green),
                      onPressed: () {}),
                ),
                const SizedBox(width: 10),
                Container(
                  decoration: BoxDecoration(
                      color: Colors.grey[100], shape: BoxShape.circle),
                  child: IconButton(
                      icon: const Icon(Icons.message, color: Colors.blue),
                      onPressed: () {}),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Cancel Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  _updateState(() {
                    _tripStatus = TripStatus.idle;
                  });
                },
                style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10))),
                child: const Text("Cancel Ride"),
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
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: _currentRideData?['driver']?['profilePicture'] != null
                      ? NetworkImage(_currentRideData!['driver']['profilePicture'])
                      : const NetworkImage('https://i.pravatar.cc/150?u=driver_default'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _tripStatus == TripStatus.arrived
                            ? 'Arrived at Destination'
                            : 'On Trip with ${_currentRideData?['driver']?['fullName'] ?? 'Driver'}',
                        style: TextStyle(
                            color: _tripStatus == TripStatus.arrived
                                ? Colors.greenAccent
                                : Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16),
                      ),
                      Text(
                        'To: $_destination • ${_distanceKm.toStringAsFixed(2)} km',
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 13),
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
            ),
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
            color: surfaceColor.withValues(alpha: 0.98),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.1),
                blurRadius: 24,
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
                    height: 6,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[700] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // OTA Test Label
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            "CABI PASSENGER v1.1.0+6 - Active",
                            style: TextStyle(
                              color: Colors.green,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // 1. Destination Picker
                      Text("Where to?",
                          style: AppTheme.outfit(
                              fontWeight: FontWeight.bold, fontSize: 24, color: onSurfaceColor)),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1F1F1F) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border:
                              Border.all(color: dividerColor, width: 1),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            )
                          ]
                        ),
                        child: InkWell(
                          onTap: () => _navigateToSearch(),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: primaryColor.withValues(alpha: 0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(Icons.search,
                                    color: primaryColor, size: 24),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  _destination,
                                  style: AppTheme.outfit(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                      color: onSurfaceColor),
                                ),
                              ),
                            ],
                          ),
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
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          children: [
            const SizedBox(height: 10),
            SizedBox(
              height: 60,
              width: 60,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                strokeWidth: 4,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "Finding your driver...",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Connecting you to nearby drivers",
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                onPressed: () {
                  _updateState(() {
                    _tripStatus = TripStatus.idle;
                    _roadRoute = null;
                  });
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text("Cancel Request"),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    final authState = ref.watch(passengerAuthProvider);
    String userName = "Guest";
    String userEmail = "";
    String initials = "G";

    if (authState is Authenticated) {
      userName = authState.user?['firstName'] != null
          ? "${authState.user!['firstName']} ${authState.user!['lastName'] ?? ''}"
          : authState.user?['name'] ?? 'User';
      userEmail = authState.user?['email'] ?? "";
      initials = userName.isNotEmpty ? userName[0].toUpperCase() : "U";
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
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.black,
              child: Text(initials,
                  style: const TextStyle(fontSize: 24, color: AppTheme.primaryColor)),
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

  // ── Service Selection Panel ──────────────────────────────────────────────
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

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0F0F0F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(color: Colors.black54, blurRadius: 30, spreadRadius: 5)
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              margin: const EdgeInsets.symmetric(vertical: 14),
              width: 44,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Choose a Service',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'To: $_destination',
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  // Back to search
                  GestureDetector(
                    onTap: () =>
                        _updateState(() => _tripStatus = TripStatus.idle),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white12,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.close,
                          color: Colors.white70, size: 20),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Service List
            ..._vehicleTypes.map((v) {
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
                child: Builder(
                  builder: (context) {
                    Color categoryColor = primaryColor;
                    if (id == 'boda') categoryColor = Colors.green.shade400;
                    if (id == 'lite') categoryColor = Colors.blue.shade400;
                    if (id == 'standard') categoryColor = primaryColor;
                    if (id == 'xl') categoryColor = Colors.purple.shade400;

                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 6),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? categoryColor.withValues(alpha: 0.1)
                            : const Color(0xFF161616),
                        border: Border.all(
                          color: isSelected ? categoryColor : Colors.white12,
                          width: isSelected ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          // Icon
                          Container(
                            width: 52,
                            height: 52,
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? categoryColor.withValues(alpha: 0.15)
                                  : Colors.white10,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Image.asset(
                              v['image'] as String,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Icon(
                                v['icon'] as IconData,
                                color:
                                    isSelected ? categoryColor : Colors.white54,
                                size: 28,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Name + capacity + ETA
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  v['name'] as String,
                                  style: TextStyle(
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.white70,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Row(
                                  children: [
                                    Icon(Icons.people_outline,
                                        size: 13, color: Colors.white38),
                                    const SizedBox(width: 4),
                                    Text(v['capacity'] as String,
                                        style: const TextStyle(
                                            color: Colors.white38,
                                            fontSize: 12)),
                                    const SizedBox(width: 12),
                                    Icon(Icons.access_time,
                                        size: 13, color: Colors.green.shade400),
                                    const SizedBox(width: 4),
                                    Text(v['time'] as String,
                                        style: TextStyle(
                                            color: Colors.green.shade400,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          // Price
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                calcPrice(id),
                                style: TextStyle(
                                  color: isSelected
                                      ? categoryColor
                                      : Colors.white54,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                              if (isSelected)
                                Container(
                                  margin: const EdgeInsets.only(top: 4),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color:
                                        categoryColor.withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'Selected',
                                    style: TextStyle(
                                        fontSize: 10,
                                        color: categoryColor,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              );
            }),

            const SizedBox(height: 16),

            // Book Button
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 28),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _startSearchSimulation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Book ${_vehicleTypes.firstWhere((v) => v['id'] == (_selectedVehicleId ?? 'standard'), orElse: () => _vehicleTypes[1])['name']}',
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

