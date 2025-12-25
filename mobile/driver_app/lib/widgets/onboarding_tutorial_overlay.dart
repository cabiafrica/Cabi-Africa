import 'package:flutter/material.dart';

class OnboardingTutorialOverlay extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingTutorialOverlay({super.key, required this.onComplete});

  @override
  State<OnboardingTutorialOverlay> createState() =>
      _OnboardingTutorialOverlayState();
}

class _OnboardingTutorialOverlayState extends State<OnboardingTutorialOverlay> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _steps = [
    {
      'title': 'Welcome to Cabi Driver',
      'description':
          'Your partner in earning. Let\'s get you set up to hit the road.',
      'icon': Icons.local_taxi,
      'color': Colors.deepPurple,
    },
    {
      'title': 'Go Online',
      'description':
          'Tap the "Go Online" button at the bottom (or toggle at the top) to start receiving ride requests.',
      'icon': Icons.power_settings_new,
      'color': Colors.green,
    },
    {
      'title': 'Track Earnings',
      'description':
          'View your daily summary and detailed wallet info right from the home screen.',
      'icon': Icons.account_balance_wallet,
      'color': Colors.amber,
    },
    {
      'title': 'Menu & Settings',
      'description':
          'Access safety tools, your profile, and app settings from the menu in the top left.',
      'icon': Icons.menu,
      'color': Colors.blue,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.85),
      child: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _steps.length,
            itemBuilder: (context, index) {
              final step = _steps[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(30),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(step['icon'], size: 80, color: step['color']),
                    ),
                    const SizedBox(height: 40),
                    Text(
                      step['title'],
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      step['description'],
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 18,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            },
          ),

          // Bottom Controls
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Column(
              children: [
                // Dots Indicator
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_steps.length, (index) {
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentPage == index
                            ? Colors.deepPurple
                            : Colors.white24,
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 30),
                // Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    onPressed: () {
                      if (_currentPage < _steps.length - 1) {
                        _controller.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      } else {
                        widget.onComplete();
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.deepPurple,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25)),
                    ),
                    child: Text(
                      _currentPage < _steps.length - 1 ? 'NEXT' : 'GET STARTED',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: widget.onComplete,
                  child: const Text('Skip Tutorial',
                      style: TextStyle(color: Colors.white54)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
