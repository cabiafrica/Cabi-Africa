# Flutter Screen Template

- **Description**: Creates a new stateful Flutter screen.
- **Target Directory**: `apps/[appName]/lib/screens/[screen_name]_screen.dart`
- **File Content**:
    ```dart
    import 'package:flutter/material.dart';

    class [ScreenName]Screen extends StatefulWidget {
      const [ScreenName]Screen({super.key});

      @override
      State<[ScreenName]Screen> createState() => _[ScreenName]ScreenState();
    }

    class _[ScreenName]ScreenState extends State<[ScreenName]Screen> {
      @override
      Widget build(BuildContext context) {
        return Scaffold(
          appBar: AppBar(title: const Text('[ScreenName]')),
          body: const Center(
            child: Text('[ScreenName] Screen'),
          ),
        );
      }
    }
    ```