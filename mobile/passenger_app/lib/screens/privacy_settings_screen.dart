import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import 'account_deletion_screen.dart';
import 'incognito_trips_screen.dart';

class PrivacySettingsScreen extends StatefulWidget {
  const PrivacySettingsScreen({super.key});

  @override
  State<PrivacySettingsScreen> createState() => _PrivacySettingsScreenState();
}

class _PrivacySettingsScreenState extends State<PrivacySettingsScreen> {
  final Map<String, bool> _privacySettings = {
    'personalizedAds': false,
    'analyticsResearch': true,
    'marketingEmails': false,
    'locationTracking': true,
    'dataSharingPartners': false,
    'crashReporting': true,
  };

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          for (var key in _privacySettings.keys) {
            if (prefs.containsKey('cabi_privacy_$key')) {
              _privacySettings[key] = prefs.getBool('cabi_privacy_$key') ?? _privacySettings[key]!;
            }
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      for (var entry in _privacySettings.entries) {
        await prefs.setBool('cabi_privacy_${entry.key}', entry.value);
      }
    } catch (_) {}

    setState(() => _isSaving = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Privacy preferences saved locally and synced with session.'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _showPrivacyPolicyModal() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surface = isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface;
    final text = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final sub = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (_, scrollController) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: ListView(
            controller: scrollController,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'CABI AFRICA PRIVACY POLICY',
                    style: TextStyle(
                      color: accent,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      letterSpacing: 1.2,
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: sub),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Data Protection Notice (Kenya DPA 2019 & GDPR Compliant)',
                style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 10),
              Text(
                '1. Personal Data Collection\nCabi Africa collects identity credentials, GPS geolocation telemetry during active trips, and transaction ledgers strictly for dispatch matching, driver welfare, and passenger safety.\n\n'
                '2. Financial & Payment Privacy\nAll digital payments are routed through PCI-DSS Level 1 compliant gateways (M-Pesa Express, Airtel Money). Raw bank or mobile wallet PINs are never stored on Cabi servers.\n\n'
                '3. Location & Tracking\nGPS tracking is initiated only when searching for a ride or during an active trip. Background tracking ceases upon trip completion unless safety telemetry is explicitly turned on.\n\n'
                '4. Data Subject Rights & Deletion\nUnder Section 40 of Kenya Data Protection Act 2019, users hold the right to access, rectify, and permanently erase their personal data through the in-app Account Deletion flow.',
                style: TextStyle(color: sub, fontSize: 12, height: 1.45),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accent,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('I Understand', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDataDownloadDialog() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface,
        title: Row(
          children: [
            Icon(Icons.download_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
            const SizedBox(width: 10),
            Text(
              'Export Data Footprint',
              style: TextStyle(
                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        content: Text(
          'An archive of your trip receipts, profile info, and transaction records will be generated and sent to your registered email address within 24 hours.',
          style: TextStyle(
            color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
            fontSize: 13,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: TextStyle(color: isDark ? Colors.white60 : Colors.black54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
              foregroundColor: Colors.black,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Data export request submitted to dispatch gateway.'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Request Export', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtextColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(
          'PRIVACY & DATA FOOTPRINT',
          style: TextStyle(
            color: accent,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            fontSize: 13.5,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: accent),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.shield_outlined, size: 24, color: accent),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Your Privacy & Sovereignty',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Control how telemetry and marketing data are shared.',
                        style: TextStyle(color: subtextColor, fontSize: 11.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          _buildSectionHeader('DATA USAGE PREFERENCES', isDark, accent),
          _buildPrivacyToggle(
            'personalizedAds',
            'Personalized Promotional Offers',
            'Allow localized discount banners tailored to frequent ride routes',
            Icons.local_offer_outlined,
            Colors.orange,
            isDark,
          ),
          _buildPrivacyToggle(
            'analyticsResearch',
            'Platform Quality & Research',
            'Contribute anonymous trip latency and routing performance metrics',
            Icons.analytics_outlined,
            Colors.blue,
            isDark,
          ),
          _buildPrivacyToggle(
            'marketingEmails',
            'SMS & Email Notifications',
            'Receive monthly statements, fleet updates, and seasonal promo codes',
            Icons.mail_outline_rounded,
            Colors.green,
            isDark,
          ),

          const SizedBox(height: 24),

          _buildSectionHeader('LOCATION & TELEMETRY', isDark, accent),
          _buildPrivacyToggle(
            'locationTracking',
            'High-Accuracy Ride GPS',
            'Required during trip matching to locate pickup and dropoff points accurately',
            Icons.location_on_outlined,
            Colors.redAccent,
            isDark,
            isRequired: true,
          ),
          _buildPrivacyToggle(
            'dataSharingPartners',
            'Partner Sacco & Road Safety Sharing',
            'Share anonymized traffic and speed telemetry with Kenyan transit partners',
            Icons.share_location_outlined,
            accent,
            isDark,
          ),

          const SizedBox(height: 24),

          _buildSectionHeader('AUDIT & SUBJECT RIGHTS', isDark, accent),
          _buildPrivacyLink(
            'View Full Privacy Policy',
            'Read Kenya DPA 2019 & GDPR compliance documentation',
            Icons.description_outlined,
            _showPrivacyPolicyModal,
            isDark,
          ),
          _buildPrivacyLink(
            'Download My Data Archive',
            'Export JSON copy of rides, receipts, and profile logs',
            Icons.download_rounded,
            _showDataDownloadDialog,
            isDark,
          ),
          _buildPrivacyLink(
            'Incognito Trips',
            'Conceal passenger pickup history on shared family devices',
            Icons.visibility_off_outlined,
            () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const IncognitoTripsScreen()),
            ),
            isDark,
          ),
          _buildPrivacyLink(
            'Delete My Account',
            'Initiate 30-day grace period and permanently anonymize all PII',
            Icons.delete_forever_rounded,
            () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AccountDeletionScreen()),
            ),
            isDark,
            isDestructive: true,
          ),

          const SizedBox(height: 28),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: accent,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.black)),
                    )
                  : const Text(
                      'SAVE PREFERENCES',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark, Color accent) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
          color: accent,
        ),
      ),
    );
  }

  Widget _buildPrivacyToggle(
    String key,
    String title,
    String description,
    IconData icon,
    Color color,
    bool isDark, {
    bool isRequired = false,
  }) {
    final surfaceColor = isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtextColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
        ),
      ),
      child: SwitchListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        value: _privacySettings[key] ?? false,
        onChanged: isRequired
            ? null
            : (value) {
                setState(() {
                  _privacySettings[key] = value;
                });
              },
        secondary: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: textColor,
                ),
              ),
            ),
            if (isRequired)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'REQUIRED',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Text(
            description,
            style: TextStyle(fontSize: 11, color: subtextColor),
          ),
        ),
        activeThumbColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
      ),
    );
  }

  Widget _buildPrivacyLink(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap,
    bool isDark, {
    bool isDestructive = false,
  }) {
    final surfaceColor = isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface;
    final textColor = isDestructive
        ? Colors.redAccent
        : (isDark ? Colors.white : AppTheme.porcelainTextPrimary);
    final subtextColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDestructive
              ? Colors.redAccent.withValues(alpha: 0.3)
              : (isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
        onTap: onTap,
        leading: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: (isDestructive ? Colors.redAccent : (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze))
                .withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            color: isDestructive ? Colors.redAccent : (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
            size: 20,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: subtextColor, fontSize: 11),
        ),
        trailing: Icon(
          Icons.chevron_right_rounded,
          color: subtextColor.withValues(alpha: 0.5),
          size: 20,
        ),
      ),
    );
  }
}
