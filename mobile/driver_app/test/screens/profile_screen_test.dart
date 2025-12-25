import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// Adjust the import path to match your project structure
import 'package:driver_app/screens/profile_screen.dart';

// Mock the service class
class MockProfileService extends Mock implements ProfileService {}

void main() {
  late MockProfileService mockProfileService;

  // Sample data for successful fetch
  final mockProfile = DriverProfile(
    id: "driver-123",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    userType: "Driver",
    registrationDate: "2024-08-10T09:00:00Z",
    accountStatus: "Active",
    averageRating: 4.85,
    badges: ["Top Rated", "Safety Star"],
    tier: "Gold",
    compliments: {"Great Service": 5},
  );

  setUp(() {
    mockProfileService = MockProfileService();
  });

  // Helper function to pump the widget with the injected mock service
  Future<void> pumpScreen(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(home: ProfileScreen(profileService: mockProfileService)),
    );
  }

  testWidgets('shows loading indicator while fetching profile', (tester) async {
    // Arrange: Make the future never complete
    when(
      () => mockProfileService.fetchMyProfile(),
    ).thenAnswer((_) => Completer<DriverProfile>().future);

    // Act
    await pumpScreen(tester);

    // Assert
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('displays an error message when fetching fails', (tester) async {
    // Arrange: Make the service throw an error
    when(
      () => mockProfileService.fetchMyProfile(),
    ).thenThrow(Exception('Failed to load profile'));

    // Act
    await pumpScreen(tester);
    await tester
        .pumpAndSettle(); // Wait for the future to resolve with an error

    // Assert
    expect(
      find.text('Error: Exception: Failed to load profile'),
      findsOneWidget,
    );
  });

  group('on successful fetch', () {
    setUp(() {
      when(
        () => mockProfileService.fetchMyProfile(),
      ).thenAnswer((_) async => mockProfile);
    });

    testWidgets('displays all profile information correctly', (tester) async {
      // Act
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('My Profile'), findsOneWidget);
      expect(find.text('John Doe'), findsOneWidget);
      expect(find.text('john.doe@example.com'), findsOneWidget);
      expect(find.text('Avg. Rating: 4.85 ★'), findsOneWidget);
      expect(find.text('555-123-4567'), findsOneWidget);
      expect(find.text('Account Status'), findsOneWidget);
      expect(find.text('Active'), findsOneWidget);
      expect(find.text('Member since 2024-08-10'), findsOneWidget);
    });

    testWidgets('tapping edit button shows a snackbar', (tester) async {
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.edit));
      await tester.pump(); // Pump for snackbar animation

      expect(find.text('Edit profile feature coming soon!'), findsOneWidget);
    });
  });
}
