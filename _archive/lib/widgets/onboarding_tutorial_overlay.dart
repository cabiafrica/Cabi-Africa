import 'package:flutter/material.dart';
import 'package:showcaseview/showcaseview.dart';

/// An overlay widget to manage and display the in-app onboarding tutorial.
///
/// This widget is responsible for initiating the tutorial that guides new drivers
/// through the main features of the app. It uses the `showcaseview` package
/// to highlight specific widgets.
///
/// The parent widget must be wrapped in a `ShowCaseWidget` and provide the global keys
/// for the elements that need to be showcased.
class OnboardingTutorialOverlay extends StatefulWidget {
  /// The child widget that will be displayed under the showcase.
  /// This is typically the main screen of the app.
  final Widget child;

  /// A map of global keys for the widgets to be highlighted.
  /// The keys should correspond to the features mentioned in the tutorial.
  final Map<String, GlobalKey> showcaseKeys;

  const OnboardingTutorialOverlay({
    super.key,
    required this.child,
    required this.showcaseKeys,
  });

  @override
  State<OnboardingTutorialOverlay> createState() =>
      _OnboardingTutorialOverlayState();
}

class _OnboardingTutorialOverlayState extends State<OnboardingTutorialOverlay> {
  @override
  void initState() {
    super.initState();
    // Start the tutorial shortly after the widget is built.
    // This ensures that the UI is ready and the keys are associated with their widgets.
    WidgetsBinding.instance.addPostFrameCallback((_) => _startTutorial());
  }

  void _startTutorial() {
    // The order of keys determines the sequence of the tutorial steps.
    final tutorialKeys = [
      widget.showcaseKeys['goOnlineButton'],
      widget.showcaseKeys['earningsScreen'],
      widget.showcaseKeys['profileSettings'],
      // 'incomingTripRequest' will be shown contextually, not in the initial flow.
    ];

    // Filter out any null keys before starting.
    final validKeys = tutorialKeys
        .where((key) => key != null)
        .cast<GlobalKey>()
        .toList();

    if (mounted && validKeys.isNotEmpty) {
      ShowCaseWidget.of(context).startShowCase(validKeys);
    }
  }

  @override
  Widget build(BuildContext context) {
    // This widget just returns the child. The actual showcase is handled by the
    // ShowCaseWidget ancestor and triggered in initState.
    return widget.child;
  }
}
