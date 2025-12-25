import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/navigation_service.dart';

/// Provider for the NavigationService.
final navigationServiceProvider = Provider((ref) => NavigationService());
