import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/screens/profile_screen.dart';
import '../mocks/image_mocks.dart';

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
    badges: [],
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
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      // Assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });

  testWidgets('displays an error message when fetching fails', (tester) async {
    // Arrange: Make the service throw an error
    when(
      () => mockProfileService.fetchMyProfile(),
    ).thenAnswer((_) async => throw Exception('Failed to load profile'));

    // Act
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      await tester.pumpAndSettle(); // Wait for the future to resolve

      // Assert
      expect(
        find.textContaining('Failed to load profile'),
        findsOneWidget,
      );
    });
  });

  group('on successful fetch', () {
    setUp(() {
      when(
        () => mockProfileService.fetchMyProfile(),
      ).thenAnswer((_) async => mockProfile);
    });

    testWidgets('displays all profile information correctly', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 2500));
      // Act
      await provideMockedNetworkImages(() async {
        await pumpScreen(tester);
        await tester.pumpAndSettle();

        // Assert
        expect(find.text('My Profile'), findsWidgets);
        expect(find.text('John Doe'), findsWidgets);
        expect(find.text('john.doe@example.com'), findsWidgets);
        // Use very simple finders
        expect(find.textContaining('4.'), findsWidgets);
        expect(find.textContaining('Gold'), findsWidgets);
        expect(find.textContaining('ACTIVE'), findsWidgets);
      });
    });

    testWidgets('tapping edit button shows a snackbar', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 2500));
      await provideMockedNetworkImages(() async {
        await pumpScreen(tester);
        await tester.pumpAndSettle();

        final editButton = find.byIcon(Icons.edit);
        expect(editButton, findsOneWidget);
        await tester.tap(editButton);
        await tester.pumpAndSettle();

        expect(find.byType(SnackBar), findsOneWidget);
      });
    });
  });
}
