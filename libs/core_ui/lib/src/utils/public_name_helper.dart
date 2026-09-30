/// Helper utility for generating and validating preferred public display names
/// strictly derived from a user's official registered legal names.
class PublicNameHelper {
  /// Generates a curated list of valid public display name options from the user's official names.
  ///
  /// Example:
  /// For "John Mwangi Kamau", generates:
  /// - "John" (First Name)
  /// - "John Kamau" (First + Last)
  /// - "John K." (First + Last Initial)
  /// - "John Mwangi" (First + Middle)
  /// - "Mwangi" (Middle Name)
  /// - "John Mwangi Kamau" (Full Legal Name)
  static List<String> generateOptions(String? officialFullName, {String? middleName}) {
    if (officialFullName == null || officialFullName.trim().isEmpty) {
      return ['User'];
    }

    final rawTokens = officialFullName
        .trim()
        .split(RegExp(r'\s+'))
        .where((t) => t.isNotEmpty)
        .toList();

    if (middleName != null && middleName.trim().isNotEmpty) {
      final midTokens = middleName.trim().split(RegExp(r'\s+'));
      for (final m in midTokens) {
        if (!rawTokens.any((t) => t.toLowerCase() == m.toLowerCase())) {
          if (rawTokens.length > 1) {
            rawTokens.insert(1, m);
          } else {
            rawTokens.add(m);
          }
        }
      }
    }

    if (rawTokens.isEmpty) return ['User'];
    if (rawTokens.length == 1) return [rawTokens.first];

    final first = _capitalize(rawTokens.first);
    final last = _capitalize(rawTokens.last);
    final Set<String> options = {};

    // 1. First Name only (Most popular preferred choice)
    options.add(first);

    // 2. First + Last
    options.add('$first $last');

    // 3. First + Last Initial
    options.add('$first ${last[0]}.');

    // If there is a middle name
    if (rawTokens.length >= 3) {
      final middle = _capitalize(rawTokens[1]);
      options.add('$first $middle');
      options.add(middle);
      options.add('$first ${middle[0]}. $last');
    }

    // Full name
    final full = rawTokens.map(_capitalize).join(' ');
    options.add(full);

    return options.toList();
  }

  /// Validates whether a custom public name candidate is strictly composed of parts of the official names.
  static bool isValid(String candidate, String officialFullName) {
    if (candidate.trim().isEmpty || officialFullName.trim().isEmpty) return false;

    final officialParts = officialFullName
        .toLowerCase()
        .split(RegExp(r'\s+'))
        .where((t) => t.isNotEmpty)
        .toSet();

    final candidateParts = candidate
        .toLowerCase()
        .replaceAll('.', '')
        .split(RegExp(r'\s+'))
        .where((t) => t.isNotEmpty);

    for (final part in candidateParts) {
      if (part.length == 1) {
        // Initial letter must match start of at least one official part
        if (!officialParts.any((op) => op.startsWith(part))) return false;
      } else {
        if (!officialParts.contains(part)) return false;
      }
    }

    return true;
  }

  static String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1).toLowerCase();
  }
}
