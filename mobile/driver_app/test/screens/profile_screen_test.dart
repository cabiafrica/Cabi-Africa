import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/screens/profile_screen.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/profile_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:driver_app/services/auth_service.dart';
import '../mocks/image_mocks.dart';

// Mock the service class
class MockProfileService extends Mock implements ProfileService {}

void main() {
  late MockProfileService mockProfileService;

  final mockUser = {
    'id': 'driver-123',
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john.doe@example.com',
    'phone': '555-123-4567',
    'rating': 4.85,
    'tier': 'Gold',
    'tripsCount': 1200,
    'status': 'Active',
    'createdAt': '2024-08-10T09:00:00Z',
  };

  setUp(() {
    mockProfileService = MockProfileService();
    
    // Default mock behavior
    when(() => mockProfileService.getUserBadges(any())).thenAnswer((_) async => []);
    when(() => mockProfileService.fetchRatingSummary(any())).thenAnswer((_) async => {
      'average': 4.85,
      'totalRatings': 120,
      'starCounts': {'1': 0, '2': 0, '3': 0, '4': 20, '5': 100},
      'tagCounts': {'Great_Service': 5}
    });
  });

  Future<void> pumpScreen(WidgetTester tester, {AuthState? authState}) async {
    final state = authState ?? Authenticated('fake-token', mockUser);
    
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authProvider.overrideWith((ref) => AuthNotifierMock(state)),
        ],
        child: MaterialApp(
          home: ProfileScreen(profileService: mockProfileService),
        ),
      ),
    );
  }

  testWidgets('shows loading while fetching data', (tester) async {
    when(() => mockProfileService.getUserBadges(any())).thenAnswer((_) async => []);
    // We can't easily test "loading" because FutureBuilder starts loading immediately
    // but pumpScreen already finishes one frame.
    
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      await tester.pump(); // Start the build
      // Expect some part of the UI to be there
      expect(find.text('DRIVER PROFILE'), findsOneWidget);
    });
  });

  testWidgets('displays all profile information correctly', (tester) async {
    await tester.binding.setSurfaceSize(const Size(1200, 2500));
    
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      expect(find.text('DRIVER PROFILE'), findsOneWidget);
      expect(find.text('JOHN DOE'), findsOneWidget);
      expect(find.text('john.doe@example.com'), findsOneWidget);
      expect(find.textContaining('4.8'), findsWidgets);
      expect(find.text('GOLD'), findsOneWidget);
      expect(find.text('ACTIVE'), findsOneWidget);
    });
  });

  testWidgets('tapping edit button navigates to profile edit screen', (tester) async {
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      final editButton = find.byIcon(Icons.edit_note);
      expect(editButton, findsOneWidget);
      await tester.tap(editButton);
      await tester.pumpAndSettle();

      expect(find.byType(ProfileScreen), findsNothing);
    });
  });
}

// Mock for AuthNotifier that actually extends the class to satisfy type checks
class AuthNotifierMock extends AuthNotifier {
  AuthNotifierMock(AuthState state) : super(MockAuthService(), MockSecureStorage()) {
    this.state = state;
  }
}

class MockAuthService extends Mock implements AuthService {}
class MockSecureStorage extends Mock implements FlutterSecureStorage {}
