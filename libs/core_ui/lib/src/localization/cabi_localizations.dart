import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// Represents a language supported by CABI Africa applications.
class AppLanguage {
  final String code;
  final String name;
  final String nativeName;
  final String flag;
  final bool isRtl;

  const AppLanguage({
    required this.code,
    required this.name,
    required this.nativeName,
    required this.flag,
    this.isRtl = false,
  });

  Locale get locale => Locale(code);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AppLanguage &&
          runtimeType == other.runtimeType &&
          code == other.code;

  @override
  int get hashCode => code.hashCode;
}

/// Central localization manager for Cabi Africa apps (Driver & Passenger).
class CabiLocalizations {
  final Locale locale;

  CabiLocalizations(this.locale);

  static const List<AppLanguage> supportedLanguages = [
    AppLanguage(
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
    ),
    AppLanguage(
      code: 'sw',
      name: 'Swahili',
      nativeName: 'Kiswahili',
      flag: '🇰🇪',
    ),
    AppLanguage(
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
    ),
    AppLanguage(
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇪🇬',
      isRtl: true,
    ),
    AppLanguage(
      code: 'am',
      name: 'Amharic',
      nativeName: 'አማርኛ',
      flag: '🇪🇹',
    ),
    AppLanguage(
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇲🇿',
    ),
    AppLanguage(
      code: 'yo',
      name: 'Yoruba',
      nativeName: 'Èdè Yorùbá',
      flag: '🇳🇬',
    ),
    AppLanguage(
      code: 'ha',
      name: 'Hausa',
      nativeName: 'Harshen Hausa',
      flag: '🇳🇬',
    ),
  ];

  static List<Locale> get supportedLocales =>
      supportedLanguages.map((l) => l.locale).toList();

  static AppLanguage getLanguage(String code) {
    return supportedLanguages.firstWhere(
      (l) => l.code == code,
      orElse: () => supportedLanguages.first,
    );
  }

  static CabiLocalizations of(BuildContext context) {
    return Localizations.of<CabiLocalizations>(context, CabiLocalizations) ??
        CabiLocalizations(const Locale('en'));
  }

  static const LocalizationsDelegate<CabiLocalizations> delegate =
      _CabiLocalizationsDelegate();

  bool get isRtl => getLanguage(locale.languageCode).isRtl;

  String get(String key) {
    final lang = locale.languageCode;
    final dict = _localizedValues[lang] ?? _localizedValues['en']!;
    return dict[key] ?? _localizedValues['en']?[key] ?? key;
  }

  // --- Common Navigation & UI ---
  String get appName => get('appName');
  String get home => get('home');
  String get settings => get('settings');
  String get profile => get('profile');
  String get wallet => get('wallet');
  String get trips => get('trips');
  String get activity => get('activity');
  String get help => get('help');
  String get logout => get('logout');
  String get save => get('save');
  String get cancel => get('cancel');
  String get confirm => get('confirm');
  String get done => get('done');
  String get back => get('back');
  String get close => get('close');
  String get search => get('search');
  String get loading => get('loading');
  String get error => get('error');
  String get success => get('success');
  String get retry => get('retry');

  // --- Language Selection ---
  String get language => get('language');
  String get selectLanguage => get('selectLanguage');
  String get choosePreferredLanguage => get('choosePreferredLanguage');
  String get searchLanguage => get('searchLanguage');
  String get currentLanguage => get('currentLanguage');
  String get languageChangedToast => get('languageChangedToast');

  // --- Driver Specific ---
  String get goOnline => get('goOnline');
  String get goOffline => get('goOffline');
  String get online => get('online');
  String get offline => get('offline');
  String get acceptRide => get('acceptRide');
  String get declineRide => get('declineRide');
  String get startTrip => get('startTrip');
  String get endTrip => get('endTrip');
  String get arrivedAtPickup => get('arrivedAtPickup');
  String get headingToDropoff => get('headingToDropoff');
  String get todaysEarnings => get('todaysEarnings');
  String get weeklyGoal => get('weeklyGoal');
  String get vehicleAccount => get('vehicleAccount');
  String get vehicleFleet => get('vehicleFleet');
  String get incentiveEligible => get('incentiveEligible');
  String get incentivePending => get('incentivePending');
  String get backToBackTrips => get('backToBackTrips');
  String get soundSettings => get('soundSettings');
  String get shiftActive => get('shiftActive');
  String get shiftInactive => get('shiftInactive');

  // --- Passenger Specific ---
  String get whereTo => get('whereTo');
  String get pickupLocation => get('pickupLocation');
  String get dropoffLocation => get('dropoffLocation');
  String get requestRide => get('requestRide');
  String get findingDriver => get('findingDriver');
  String get driverArriving => get('driverArriving');
  String get tripInProgress => get('tripInProgress');
  String get tripCompleted => get('tripCompleted');
  String get rateYourRide => get('rateYourRide');
  String get fareEstimate => get('fareEstimate');
  String get paymentMethod => get('paymentMethod');
  String get cash => get('cash');
  String get card => get('card');
  String get mpesa => get('mpesa');
  String get promoCode => get('promoCode');
  String get trustedContacts => get('trustedContacts');
  String get emergencySos => get('emergencySos');

  // --- Settings & Themes ---
  String get appearance => get('appearance');
  String get darkMode => get('darkMode');
  String get lightMode => get('lightMode');
  String get systemMode => get('systemMode');
  String get notifications => get('notifications');
  String get privacySecurity => get('privacySecurity');
  String get mapProvider => get('mapProvider');
  String get aboutApp => get('aboutApp');
  String get version => get('version');
  String get externalNavigation => get('externalNavigation');
  String get safetyCommandCenter => get('safetyCommandCenter');
  String get deleteAccount => get('deleteAccount');
  String get tripAudioChimes => get('tripAudioChimes');
  String get biometricIdentity => get('biometricIdentity');
  String get dataPrivacy => get('dataPrivacy');
  String get soundPresetCharacter => get('soundPresetCharacter');
  String get saccoSavings => get('saccoSavings');
  String get savingsRate => get('savingsRate');
  String get dailyWelfare => get('dailyWelfare');
  String get accumulatedSavings => get('accumulatedSavings');
  String get saccoRemittanceLedger => get('saccoRemittanceLedger');
  String get emergencyLiquidity => get('emergencyLiquidity');
  String get perTripDeduction => get('perTripDeduction');

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'appName': 'Cabi Africa',
      'home': 'Home',
      'settings': 'Settings',
      'profile': 'Profile',
      'wallet': 'Wallet',
      'trips': 'Trips',
      'activity': 'Activity',
      'help': 'Help & Support',
      'logout': 'Log Out',
      'save': 'Save',
      'cancel': 'Cancel',
      'confirm': 'Confirm',
      'done': 'Done',
      'back': 'Back',
      'close': 'Close',
      'search': 'Search',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'retry': 'Retry',
      'language': 'Language',
      'selectLanguage': 'Select Language',
      'choosePreferredLanguage': 'Choose your preferred language for the app',
      'searchLanguage': 'Search languages...',
      'currentLanguage': 'Current Language',
      'languageChangedToast': 'Language updated successfully',
      'goOnline': 'Go Online',
      'goOffline': 'Go Offline',
      'online': 'Online',
      'offline': 'Offline',
      'acceptRide': 'Accept Ride',
      'declineRide': 'Decline',
      'startTrip': 'Start Trip',
      'endTrip': 'End Trip',
      'arrivedAtPickup': 'Arrived at Pickup',
      'headingToDropoff': 'Heading to Destination',
      'todaysEarnings': "Today's Earnings",
      'weeklyGoal': 'Weekly Goal',
      'vehicleAccount': 'Vehicle Account',
      'vehicleFleet': 'Vehicles & Fleet',
      'incentiveEligible': 'Qualified for Incentive',
      'incentivePending': 'Incentive In Progress',
      'backToBackTrips': 'Back-to-Back Requests',
      'soundSettings': 'Sound Alerts & Chimes',
      'shiftActive': 'Active Shift',
      'shiftInactive': 'Off Duty',
      'whereTo': 'Where to?',
      'pickupLocation': 'Pickup Location',
      'dropoffLocation': 'Destination',
      'requestRide': 'Request Ride',
      'findingDriver': 'Finding your driver...',
      'driverArriving': 'Driver is on the way',
      'tripInProgress': 'Trip in progress',
      'tripCompleted': 'Trip completed',
      'rateYourRide': 'Rate your ride',
      'fareEstimate': 'Fare Estimate',
      'paymentMethod': 'Payment Method',
      'cash': 'Cash',
      'card': 'Credit / Debit Card',
      'mpesa': 'M-Pesa / Mobile Money',
      'promoCode': 'Promo Code',
      'trustedContacts': 'Trusted Contacts',
      'emergencySos': 'Emergency SOS',
      'appearance': 'Appearance',
      'darkMode': 'Dark Mode',
      'lightMode': 'Light Mode',
      'systemMode': 'System Default',
      'notifications': 'Notifications',
      'privacySecurity': 'Privacy & Security',
      'mapProvider': 'Map Provider',
      'aboutApp': 'About Cabi',
      'version': 'Version',
      'externalNavigation': 'Navigation App',
      'safetyCommandCenter': 'Safety Command Center',
      'deleteAccount': 'Delete Account',
      'tripAudioChimes': 'Trip Audio Chimes',
      'biometricIdentity': 'Biometric & Identity',
      'dataPrivacy': 'Privacy & Data',
      'soundPresetCharacter': 'Sound Preset Character',
      'saccoSavings': 'SACCO Savings & Deductions',
      'savingsRate': 'Per-Trip Savings Rate',
      'dailyWelfare': 'Daily Welfare Contribution',
      'accumulatedSavings': 'Total Accumulated Savings',
      'saccoRemittanceLedger': 'Remittance Ledger',
      'emergencyLiquidity': 'Emergency Liquidity',
      'perTripDeduction': 'Per-Trip Deductions',
    },
    'sw': {
      'appName': 'Cabi Africa',
      'home': 'Mwanzo',
      'settings': 'Mipangilio',
      'profile': 'Wasifu',
      'wallet': 'Pochi',
      'trips': 'Safari Zangu',
      'activity': 'Shughuli',
      'help': 'Msaada na Huduma',
      'logout': 'Toka',
      'save': 'Hifadhi',
      'cancel': 'Ghairi',
      'confirm': 'Thibitisha',
      'done': 'Imekamilika',
      'back': 'Rudi',
      'close': 'Funga',
      'search': 'Tafuta',
      'loading': 'Inapakia...',
      'error': 'Hitilafu',
      'success': 'Imefanikiwa',
      'retry': 'Jaribu tena',
      'language': 'Lugha',
      'selectLanguage': 'Chagua Lugha',
      'choosePreferredLanguage': 'Chagua lugha unayopendelea kwa programu',
      'searchLanguage': 'Tafuta lugha...',
      'currentLanguage': 'Lugha ya Sasa',
      'languageChangedToast': 'Lugha imebadilishwa kikamilifu',
      'goOnline': 'Ingia Mtandaoni',
      'goOffline': 'Toka Mtandaoni',
      'online': 'Upo Mtandaoni',
      'offline': 'Haupo Mtandaoni',
      'acceptRide': 'Kubali Safari',
      'declineRide': 'Kataa',
      'startTrip': 'Anza Safari',
      'endTrip': 'Maliza Safari',
      'arrivedAtPickup': 'Nimewasili pa Kuchukulia',
      'headingToDropoff': 'Tunaelekea Mwafaka',
      'todaysEarnings': 'Mapato ya Leo',
      'weeklyGoal': 'Lengo la Wiki',
      'vehicleAccount': 'Akaunti ya Gari',
      'vehicleFleet': 'Magari na Meli',
      'incentiveEligible': 'Umehitimu Motisha',
      'incentivePending': 'Motisha Inaendelea',
      'backToBackTrips': 'Maombi mfululizo',
      'soundSettings': 'Sauti na Arifa',
      'shiftActive': 'Zamu Inatumika',
      'shiftInactive': 'Pumziko',
      'whereTo': 'Unaelekea wapi?',
      'pickupLocation': 'Mahali pa Kuchukuliwa',
      'dropoffLocation': 'Unakoenda',
      'requestRide': 'Omba Safari',
      'findingDriver': 'Tunakutafutia dereva...',
      'driverArriving': 'Dereva yuko njiani',
      'tripInProgress': 'Safari inaendelea',
      'tripCompleted': 'Safari imekamilika',
      'rateYourRide': 'Kadiria safari yako',
      'fareEstimate': 'Makadirio ya Nauli',
      'paymentMethod': 'Njia ya Malipo',
      'cash': 'Pesa Taslimu',
      'card': 'Kadi ya Benki',
      'mpesa': 'M-Pesa / Malipo ya Simu',
      'promoCode': 'Kuponi ya Punguzo',
      'trustedContacts': 'Watu wa Kuaminika',
      'emergencySos': 'Msaada wa Dharura (SOS)',
      'appearance': 'Muonekano',
      'darkMode': 'Hali ya Giza',
      'lightMode': 'Hali ya Mwangaza',
      'systemMode': 'Kama Mfumo wa Simu',
      'notifications': 'Arifa',
      'privacySecurity': 'Faragha na Usalama',
      'mapProvider': 'Ramani',
      'aboutApp': 'Kuhusu Cabi',
      'version': 'Toleo',
      'externalNavigation': 'Programu ya Uelekezaji',
      'safetyCommandCenter': 'Kituo cha Usalama',
      'deleteAccount': 'Futa Akaunti',
      'tripAudioChimes': 'Milio ya Safari',
      'biometricIdentity': 'Kibayometriki na Utambulisho',
      'dataPrivacy': 'Faragha na Data',
      'soundPresetCharacter': 'Tabia ya Mlio',
      'saccoSavings': 'Akiba na Makato ya SACCO',
      'savingsRate': 'Kiwango cha Akiba kwa Safari',
      'dailyWelfare': 'Mchango wa Ustawi wa Kila Siku',
      'accumulatedSavings': 'Jumla ya Akiba Iliyokusanywa',
      'saccoRemittanceLedger': 'Daftari la Makato',
      'emergencyLiquidity': 'Akiba ya Dharura Papo Hapo',
      'perTripDeduction': 'Makato ya Safari',
    },
    'fr': {
      'appName': 'Cabi Africa',
      'home': 'Accueil',
      'settings': 'Paramètres',
      'profile': 'Profil',
      'wallet': 'Portefeuille',
      'trips': 'Trajets',
      'activity': 'Activité',
      'help': 'Aide & Assistance',
      'logout': 'Déconnexion',
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'confirm': 'Confirmer',
      'done': 'Terminé',
      'back': 'Retour',
      'close': 'Fermer',
      'search': 'Rechercher',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succès',
      'retry': 'Réessayer',
      'language': 'Langue',
      'selectLanguage': 'Choisir la langue',
      'choosePreferredLanguage': 'Choisissez votre langue préférée pour l’application',
      'searchLanguage': 'Rechercher une langue...',
      'currentLanguage': 'Langue actuelle',
      'languageChangedToast': 'Langue modifiée avec succès',
      'goOnline': 'Passer en ligne',
      'goOffline': 'Passer hors ligne',
      'online': 'En ligne',
      'offline': 'Hors ligne',
      'acceptRide': 'Accepter la course',
      'declineRide': 'Refuser',
      'startTrip': 'Démarrer la course',
      'endTrip': 'Terminer la course',
      'arrivedAtPickup': 'Arrivé au point de prise',
      'headingToDropoff': 'En route vers destination',
      'todaysEarnings': "Gains d'aujourd'hui",
      'weeklyGoal': 'Objectif hebdomadaire',
      'vehicleAccount': 'Compte Véhicule',
      'vehicleFleet': 'Véhicules & Flotte',
      'incentiveEligible': 'Qualifié pour la prime',
      'incentivePending': 'Prime en cours',
      'backToBackTrips': 'Courses enchaînées',
      'soundSettings': 'Sons & Alertes',
      'shiftActive': 'Service Actif',
      'shiftInactive': 'Hors Service',
      'whereTo': 'Où allez-vous ?',
      'pickupLocation': 'Lieu de prise en charge',
      'dropoffLocation': 'Destination',
      'requestRide': 'Commander une course',
      'findingDriver': 'Recherche d’un chauffeur...',
      'driverArriving': 'Le chauffeur arrive',
      'tripInProgress': 'Course en cours',
      'tripCompleted': 'Course terminée',
      'rateYourRide': 'Notez votre course',
      'fareEstimate': 'Estimation du prix',
      'paymentMethod': 'Mode de paiement',
      'cash': 'Espèces',
      'card': 'Carte Bancaire',
      'mpesa': 'M-Pesa / Mobile Money',
      'promoCode': 'Code Promo',
      'trustedContacts': 'Contacts de confiance',
      'emergencySos': 'Urgence SOS',
      'appearance': 'Apparence',
      'darkMode': 'Mode Sombre',
      'lightMode': 'Mode Clair',
      'systemMode': 'Par défaut du système',
      'notifications': 'Notifications',
      'privacySecurity': 'Confidentialité & Sécurité',
      'mapProvider': 'Fournisseur de carte',
      'aboutApp': 'À propos de Cabi',
      'version': 'Version',
      'externalNavigation': 'Application de Navigation',
      'safetyCommandCenter': 'Centre de Sécurité',
      'deleteAccount': 'Supprimer le Compte',
      'tripAudioChimes': 'Sons de Course',
      'biometricIdentity': 'Biométrie et Identité',
      'dataPrivacy': 'Confidentialité et Données',
      'soundPresetCharacter': 'Caractère Sonore',
      'saccoSavings': 'Épargne et Déductions SACCO',
      'savingsRate': 'Taux d’épargne par trajet',
      'dailyWelfare': 'Contribution d’aide quotidienne',
      'accumulatedSavings': 'Épargne totale accumulée',
      'saccoRemittanceLedger': 'Grand livre des retenues',
      'emergencyLiquidity': 'Liquidité d’urgence instantanée',
      'perTripDeduction': 'Déductions par trajet',
    },
    'ar': {
      'appName': 'كابي أفريقيا',
      'home': 'الرئيسية',
      'settings': 'الإعدادات',
      'profile': 'الملف الشخصي',
      'wallet': 'المحفظة',
      'trips': 'رحلاتي',
      'activity': 'النشاط',
      'help': 'المساعدة والدعم',
      'logout': 'تسجيل الخروج',
      'save': 'حفظ',
      'cancel': 'إلغاء',
      'confirm': 'تأكيد',
      'done': 'تم',
      'back': 'رجوع',
      'close': 'إغلاق',
      'search': 'بحث',
      'loading': 'جارٍ التحميل...',
      'error': 'خطأ',
      'success': 'نجاح',
      'retry': 'إعادة المحاولة',
      'language': 'اللغة',
      'selectLanguage': 'اختر اللغة',
      'choosePreferredLanguage': 'اختر لغتك المفضلة للتطبيق',
      'searchLanguage': 'ابحث عن لغة...',
      'currentLanguage': 'اللغة الحالية',
      'languageChangedToast': 'تم تغيير اللغة بنجاح',
      'goOnline': 'اتصال بالإنترنت',
      'goOffline': 'قطع الاتصال',
      'online': 'متصل',
      'offline': 'غير متصل',
      'acceptRide': 'قبول الطلب',
      'declineRide': 'رفض',
      'startTrip': 'بدء الرحلة',
      'endTrip': 'إنهاء الرحلة',
      'arrivedAtPickup': 'وصلت إلى نقطة الانطلاق',
      'headingToDropoff': 'في الطريق إلى الوجهة',
      'todaysEarnings': 'أرباح اليوم',
      'weeklyGoal': 'الهدف الأسبوعي',
      'vehicleAccount': 'حساب المركبة',
      'vehicleFleet': 'المركبات والأسطول',
      'incentiveEligible': 'مؤهل للمكافأة',
      'incentivePending': 'المكافأة قيد التقدم',
      'backToBackTrips': 'الطلبات المتتالية',
      'soundSettings': 'تنبيهات الصوت',
      'shiftActive': 'الوردية نشطة',
      'shiftInactive': 'خارج الخدمة',
      'whereTo': 'إلى أين تريد الذهاب؟',
      'pickupLocation': 'موقع الانطلاق',
      'dropoffLocation': 'الوجهة',
      'requestRide': 'طلب رحلة',
      'findingDriver': 'جارٍ البحث عن سائق...',
      'driverArriving': 'السائق في الطريق إليك',
      'tripInProgress': 'الرحلة جارية',
      'tripCompleted': 'تمت الرحلة بنجاح',
      'rateYourRide': 'قيّم رحلتك',
      'fareEstimate': 'تقدير الأجرة',
      'paymentMethod': 'طريقة الدفع',
      'cash': 'نقداً',
      'card': 'بطاقة بنكية',
      'mpesa': 'أم بيسا / محفظة الهاتف',
      'promoCode': 'رمز الخصم',
      'trustedContacts': 'جهات الاتصال الموثوقة',
      'emergencySos': 'طوارئ SOS',
      'appearance': 'المظهر',
      'darkMode': 'الوضع الداكن',
      'lightMode': 'الوضع الفاتح',
      'systemMode': 'تلقائي حسب النظام',
      'notifications': 'الإشعارات',
      'privacySecurity': 'الخصوصية والأمان',
      'mapProvider': 'مزود الخرائط',
      'aboutApp': 'عن كابي',
      'version': 'الإصدار',
      'externalNavigation': 'تطبيق الملاحة',
      'safetyCommandCenter': 'مركز الأمان',
      'deleteAccount': 'حذف الحساب',
      'tripAudioChimes': 'نغمات الرحلة',
      'biometricIdentity': 'الهوية البيومترية',
      'dataPrivacy': 'الخصوصية والبيانات',
      'soundPresetCharacter': 'طابع الصوت',
      'saccoSavings': 'مدخرات وخصومات ساكو',
      'savingsRate': 'معدل الادخار لكل رحلة',
      'dailyWelfare': 'مساهمة الرعاية اليومية',
      'accumulatedSavings': 'إجمالي المدخرات المتراكمة',
      'saccoRemittanceLedger': 'سجل التحويلات المالية',
      'emergencyLiquidity': 'سيولة الطوارئ الفورية',
      'perTripDeduction': 'خصومات كل رحلة',
    },
    'pt': {
      'appName': 'Cabi África',
      'home': 'Início',
      'settings': 'Definições',
      'profile': 'Perfil',
      'wallet': 'Carteira',
      'trips': 'Viagens',
      'activity': 'Actividade',
      'help': 'Ajuda & Suporte',
      'logout': 'Terminar Sessão',
      'save': 'Guardar',
      'cancel': 'Cancelar',
      'confirm': 'Confirmar',
      'done': 'Concluído',
      'back': 'Voltar',
      'close': 'Fechar',
      'search': 'Pesquisar',
      'loading': 'A carregar...',
      'error': 'Erro',
      'success': 'Sucesso',
      'retry': 'Tentar novamente',
      'language': 'Idioma',
      'selectLanguage': 'Selecionar Idioma',
      'choosePreferredLanguage': 'Escolha o seu idioma de preferência para o aplicativo',
      'searchLanguage': 'Pesquisar idioma...',
      'currentLanguage': 'Idioma Atual',
      'languageChangedToast': 'Idioma atualizado com sucesso',
      'goOnline': 'Ficar Online',
      'goOffline': 'Ficar Offline',
      'online': 'Online',
      'offline': 'Offline',
      'acceptRide': 'Aceitar Viagem',
      'declineRide': 'Recusar',
      'startTrip': 'Iniciar Viagem',
      'endTrip': 'Terminar Viagem',
      'arrivedAtPickup': 'Cheguei ao Ponto de Recolha',
      'headingToDropoff': 'A caminho do destino',
      'todaysEarnings': 'Ganhos de Hoje',
      'weeklyGoal': 'Meta Semanal',
      'vehicleAccount': 'Conta do Veículo',
      'vehicleFleet': 'Veículos & Frota',
      'incentiveEligible': 'Qualificado para Bónus',
      'incentivePending': 'Bónus em Progresso',
      'backToBackTrips': 'Viagens Consecutivas',
      'soundSettings': 'Sons e Alertas',
      'shiftActive': 'Turno Ativo',
      'shiftInactive': 'Fora de Serviço',
      'whereTo': 'Para onde vai?',
      'pickupLocation': 'Local de Partida',
      'dropoffLocation': 'Destino',
      'requestRide': 'Pedir Viagem',
      'findingDriver': 'A procurar motorista...',
      'driverArriving': 'O motorista está a caminho',
      'tripInProgress': 'Viagem em curso',
      'tripCompleted': 'Viagem concluída',
      'rateYourRide': 'Avalie a sua viagem',
      'fareEstimate': 'Estimativa de Preço',
      'paymentMethod': 'Forma de Pagamento',
      'cash': 'Dinheiro',
      'card': 'Cartão Bancário',
      'mpesa': 'M-Pesa / Pagamento Móvel',
      'promoCode': 'Código Promocional',
      'trustedContacts': 'Contactos de Confiança',
      'emergencySos': 'SOS de Emergência',
      'appearance': 'Aparência',
      'darkMode': 'Modo Escuro',
      'lightMode': 'Modo Claro',
      'systemMode': 'Padrão do Sistema',
      'notifications': 'Notificações',
      'privacySecurity': 'Privacidade & Segurança',
      'mapProvider': 'Fornecedor de Mapas',
      'aboutApp': 'Sobre a Cabi',
      'version': 'Versão',
      'externalNavigation': 'Aplicativo de Navegação',
      'safetyCommandCenter': 'Centro de Segurança',
      'deleteAccount': 'Excluir Conta',
      'tripAudioChimes': 'Toques de Viagem',
      'biometricIdentity': 'Biometria e Identidade',
      'dataPrivacy': 'Privacidade e Dados',
      'soundPresetCharacter': 'Caractere de Som',
      'saccoSavings': 'Poupança e Deduções SACCO',
      'savingsRate': 'Taxa de poupança por viagem',
      'dailyWelfare': 'Contribuição diária de bem-estar',
      'accumulatedSavings': 'Poupança total acumulada',
      'saccoRemittanceLedger': 'Livro de remessas',
      'emergencyLiquidity': 'Liquidez imediata de emergência',
      'perTripDeduction': 'Deduções por viagem',
    },
    'am': {
      'appName': 'ካቢ አፍሪካ',
      'home': 'ዋና ገጽ',
      'settings': 'ቅንብሮች',
      'profile': 'መገለጫ',
      'wallet': 'የኪስ ቦርሳ',
      'trips': 'ጉዞዎች',
      'activity': 'እንቅስቃሴ',
      'help': 'እርዳታና ድጋፍ',
      'logout': 'ውጣ',
      'save': 'አስቀምጥ',
      'cancel': 'ሰርዝ',
      'confirm': 'አረጋግጥ',
      'done': 'ተጠናቋል',
      'back': 'ተመለስ',
      'close': 'ዝጋ',
      'search': 'ፈልግ',
      'loading': 'በመጫን ላይ...',
      'error': 'ስህተት',
      'success': 'ተሳክቷል',
      'retry': 'እንደገና ሞክር',
      'language': 'ቋንቋ',
      'selectLanguage': 'ቋንቋ ይምረጡ',
      'choosePreferredLanguage': 'ለመተግበሪያው የሚመርጡትን ቋንቋ ይምረጡ',
      'searchLanguage': 'ቋንቋ ፈልግ...',
      'currentLanguage': 'የአሁኑ ቋንቋ',
      'languageChangedToast': 'ቋንቋው በሚገባ ተቀይሯል',
      'goOnline': 'የመስመር ላይ ሁን',
      'goOffline': 'ከመስመር ውጭ ሁን',
      'online': 'በመስመር ላይ',
      'offline': 'ከመስመር ውጭ',
      'acceptRide': 'ጉዞውን ተቀበል',
      'declineRide': 'አትቀበል',
      'startTrip': 'ጉዞ ጀምር',
      'endTrip': 'ጉዞ ጨርስ',
      'arrivedAtPickup': 'መነሻ ቦታ ደርሻለሁ',
      'headingToDropoff': 'ወደ መድረሻው በመሄድ ላይ',
      'todaysEarnings': 'የዛሬ ገቢ',
      'weeklyGoal': 'የሳምንቱ ግብ',
      'vehicleAccount': 'የመኪና አካውንት',
      'vehicleFleet': 'ተሽከርካሪዎች',
      'incentiveEligible': 'ለሽልማት ብቁ',
      'incentivePending': 'ሽልማት በሂደት ላይ',
      'backToBackTrips': 'ተከታታይ ጥያቄዎች',
      'soundSettings': 'የድምፅ ቅንብሮች',
      'shiftActive': 'ስራ ላይ',
      'shiftInactive': 'ከስራ ውጭ',
      'whereTo': 'ወዴት መሄድ ይፈልጋሉ?',
      'pickupLocation': 'መነሻ ቦታ',
      'dropoffLocation': 'መድረሻ ቦታ',
      'requestRide': 'ጉዞ ጠይቅ',
      'findingDriver': 'አሽከርካሪ በመፈለግ ላይ...',
      'driverArriving': 'አሽከርካሪው እየመጣ ነው',
      'tripInProgress': 'ጉዞው በሂደት ላይ ነው',
      'tripCompleted': 'ጉዞው ተጠናቋል',
      'rateYourRide': 'ጉዞዎን ይገምግሙ',
      'fareEstimate': 'የታሪፍ ግምት',
      'paymentMethod': 'የክፍያ ዘዴ',
      'cash': 'ጥሬ ገንዘብ',
      'card': 'የባንክ ካርድ',
      'mpesa': 'ኤም-ፔሳ / የሞባይል ክፍያ',
      'promoCode': 'የቅናሽ ኮድ',
      'trustedContacts': 'የታመኑ እውቂያዎች',
      'emergencySos': 'የአስቸኳይ ጊዜ እርዳታ (SOS)',
      'appearance': 'መልክ',
      'darkMode': 'ጨለማ ሁነታ',
      'lightMode': 'ብሩህ ሁነታ',
      'systemMode': 'የስልክ ነባሪ',
      'notifications': 'ማሳወቂያዎች',
      'privacySecurity': 'ግላዊነትና ደህንነት',
      'mapProvider': 'የካርታ አቅራቢ',
      'aboutApp': 'ስለ ካቢ',
      'version': 'ስሪት',
      'externalNavigation': 'የአሰሳ መተግበሪያ',
      'safetyCommandCenter': 'የደህንነት ማዕከል',
      'deleteAccount': 'መለያ ሰርዝ',
      'tripAudioChimes': 'የጉዞ ድምፅ',
      'biometricIdentity': 'ባዮሜትሪክ መታወቂያ',
      'dataPrivacy': 'ግላዊነት እና ውሂብ',
      'soundPresetCharacter': 'የድምፅ ባህሪ',
      'saccoSavings': 'የሳኮ ቁጠባ እና ቅነሳዎች',
      'savingsRate': 'በእያንዳንዱ ጉዞ የቁጠባ ምጣኔ',
      'dailyWelfare': 'የእለት ደህንነት መዋጮ',
      'accumulatedSavings': 'አጠቃላይ የተጠራቀመ ቁጠባ',
      'saccoRemittanceLedger': 'የቅነሳዎች መዝገብ',
      'emergencyLiquidity': 'የአደጋ ጊዜ ፈጣን ገንዘብ',
      'perTripDeduction': 'የጉዞ ቅነሳዎች',
    },
    'yo': {
      'appName': 'Cabi Africa',
      'home': 'Ile',
      'settings': 'Eto',
      'profile': 'Profaili',
      'wallet': 'Apo Owo',
      'trips': 'Awon Irin-Ajo',
      'activity': 'Ise',
      'help': 'Iranlowo',
      'logout': 'Wole Jade',
      'save': 'Fipamo',
      'cancel': 'Fagilee',
      'confirm': 'Fidi Re Mule',
      'done': 'O Pari',
      'back': 'Pada',
      'close': 'Ti Ilekun',
      'search': 'Wa',
      'loading': 'N gbe wole...',
      'error': 'Asise',
      'success': 'Aseyori',
      'retry': 'Gbiyanju Lekan Si',
      'language': 'Ede',
      'selectLanguage': 'Yan Ede',
      'choosePreferredLanguage': 'Yan ede ti o fẹran fun ohun elo naa',
      'searchLanguage': 'Wa ede...',
      'currentLanguage': 'Ede Lọwọlọwọ',
      'languageChangedToast': 'A ti yi ede pada ni aseyori',
      'goOnline': 'Lo Si Ori Ayelujara',
      'goOffline': 'Kuro Ni Ori Ayelujara',
      'online': 'Lori Ayelujara',
      'offline': 'Ko si Lori Ayelujara',
      'acceptRide': 'Gba Irin-Ajo',
      'declineRide': 'Ko',
      'startTrip': 'Bẹrẹ Irin-Ajo',
      'endTrip': 'Pari Irin-Ajo',
      'arrivedAtPickup': 'Mo ti de ibi gbigbe',
      'headingToDropoff': 'N lo si ibi iduro',
      'todaysEarnings': 'Owo Ti O Wole Loni',
      'weeklyGoal': 'Ero Ose',
      'vehicleAccount': 'Akoto Oko',
      'vehicleFleet': 'Awon Oko',
      'incentiveEligible': 'Yẹ Fun Ere',
      'incentivePending': 'Ere N Lọ Lọwọ',
      'backToBackTrips': 'Awon ibeere tele ara won',
      'soundSettings': 'Awon iwifun ohun',
      'shiftActive': 'Ise N Lo Lowo',
      'shiftInactive': 'Ko Sise',
      'whereTo': 'Nibo ni o nlo?',
      'pickupLocation': 'Ibi ti a o ti gbe o',
      'dropoffLocation': 'Ibi ti o nlo',
      'requestRide': 'Beere Fun Oko',
      'findingDriver': 'N wa awakọ fun ọ...',
      'driverArriving': 'Awakọ n bọ lọna',
      'tripInProgress': 'Irin-ajo n lọ lọwọ',
      'tripCompleted': 'Irin-ajo ti pari',
      'rateYourRide': 'Se idiyele irin-ajo rẹ',
      'fareEstimate': 'Iye owo ti a fo ri ba',
      'paymentMethod': 'Ọna Isanwo',
      'cash': 'Owo Owo',
      'card': 'Kaadi Ifowopamọ',
      'mpesa': 'M-Pesa / Owo Apo Foonu',
      'promoCode': 'Koodu Idinku',
      'trustedContacts': 'Awon Olubasọrọ Ti O Gbẹkẹle',
      'emergencySos': 'Pajawiri SOS',
      'appearance': 'Iriri',
      'darkMode': 'Ipo Dudu',
      'lightMode': 'Ipo Imọlẹ',
      'systemMode': 'Aiyipada Eto Foonu',
      'notifications': 'Awon iwifun',
      'privacySecurity': 'Aṣiri & Aabo',
      'mapProvider': 'Olupese Maapu',
      'aboutApp': 'Nipa Cabi',
      'version': 'Ẹya',
      'externalNavigation': 'Eto Itọsọna Opopona',
      'safetyCommandCenter': 'Ile-iṣẹ Aabo',
      'deleteAccount': 'Pa Account Rẹ Rẹ',
      'tripAudioChimes': 'Ohùn Irin-ajo',
      'biometricIdentity': 'Idanimọ Biometric',
      'dataPrivacy': 'Aṣiri ati Data',
      'soundPresetCharacter': 'Irú Ohùn',
      'saccoSavings': 'Ifowopamọ ati Awọn Iyọkuro SACCO',
      'savingsRate': 'Oṣuwọn Ifowopamọ fun Irin-ajo kọọkan',
      'dailyWelfare': 'Idasi Idagbasoke Ojoojumọ',
      'accumulatedSavings': 'Lapapọ Ifowopamọ ti a Kojọpọ',
      'saccoRemittanceLedger': 'Iwe Akọsilẹ Iyọkuro',
      'emergencyLiquidity': 'Owo Pajawiri Lẹsẹkẹsẹ',
      'perTripDeduction': 'Awọn Iyọkuro Irin-ajo',
    },
    'ha': {
      'appName': 'Cabi Africa',
      'home': 'Gida',
      'settings': 'Saituna',
      'profile': 'Bayanin Martaba',
      'wallet': 'Aljihu',
      'trips': 'Tafiye-tafiye',
      'activity': 'Ayyuka',
      'help': 'Taimako',
      'logout': 'Fita',
      'save': 'Ajiye',
      'cancel': 'Soke',
      'confirm': 'Tabbatar',
      'done': 'An Gama',
      'back': 'Koma Baya',
      'close': 'Rufe',
      'search': 'Bincika',
      'loading': 'Yana lodi...',
      'error': 'Kuskure',
      'success': 'Nasarar',
      'retry': 'Sake gwadawa',
      'language': 'Harshe',
      'selectLanguage': 'Zabi Harshe',
      'choosePreferredLanguage': 'Zabi yaren da kake so don manhajar',
      'searchLanguage': 'Nemi yare...',
      'currentLanguage': 'Harshen Yanzu',
      'languageChangedToast': 'An canza yare cikin nasara',
      'goOnline': 'Shiga Layi',
      'goOffline': 'Fita Layi',
      'online': 'A Kan Layi',
      'offline': 'Ba a Kan Layi Ba',
      'acceptRide': 'Karbi Tafiya',
      'declineRide': 'Ki Karba',
      'startTrip': 'Fara Tafiya',
      'endTrip': 'Kammala Tafiya',
      'arrivedAtPickup': 'Na isa wurin dauka',
      'headingToDropoff': 'Kele hanyar zuwa inda aka nufa',
      'todaysEarnings': 'Kudin Shiga Na Yau',
      'weeklyGoal': 'Burin Mako',
      'vehicleAccount': 'Asusun Mota',
      'vehicleFleet': 'Motoci da Runduna',
      'incentiveEligible': 'Ya cancanci Garabasa',
      'incentivePending': 'Garabasa na kan aiki',
      'backToBackTrips': 'Bukatu a Jere',
      'soundSettings': 'Saitunan Sautuka',
      'shiftActive': 'Aiki Yana Tafiya',
      'shiftInactive': 'Hutu',
      'whereTo': 'Ina za a je?',
      'pickupLocation': 'Wurin Dauka',
      'dropoffLocation': 'Inda za a sauka',
      'requestRide': 'Nemi Mota',
      'findingDriver': 'Ana neman direba...',
      'driverArriving': 'Direba yana kan hanya',
      'tripInProgress': 'Tafiya na ci gaba',
      'tripCompleted': 'An kammala tafiya',
      'rateYourRide': 'Bada maki ga tafiyarka',
      'fareEstimate': 'Kimanin Kudin Mota',
      'paymentMethod': 'Hanyar Biyan Kudi',
      'cash': 'Kudi a Hannu',
      'card': 'Katin Banki',
      'mpesa': 'M-Pesa / Biyan Kudi ta Waya',
      'promoCode': 'Lambar Rage Farashi',
      'trustedContacts': 'Amintattun Lambobin Sadarwa',
      'emergencySos': 'Kiran Gaggawa (SOS)',
      'appearance': 'Siffa',
      'darkMode': 'Yanayin Duhu',
      'lightMode': 'Yanayin Haske',
      'systemMode': 'Kamar yadda wayar take',
      'notifications': 'Sanarwa',
      'privacySecurity': 'Sirri da Tsaro',
      'mapProvider': 'Taswira',
      'aboutApp': 'Game da Cabi',
      'version': 'Sigar',
      'externalNavigation': 'Manhajar Kewayawa',
      'safetyCommandCenter': 'Cibiyar Tsaro',
      'deleteAccount': 'Share Asusu',
      'tripAudioChimes': 'Sautin Tafiya',
      'biometricIdentity': 'Shaidar Halitta',
      'dataPrivacy': 'Sirri da Bayanai',
      'soundPresetCharacter': 'Yanayin Sauti',
      'saccoSavings': 'Adana da Rage-rage na SACCO',
      'savingsRate': 'Kason Adana na Kowane Tafiya',
      'dailyWelfare': 'Gudunmawar Jin Dadin Jama\'a na Kullum',
      'accumulatedSavings': 'Jimillar Adana da Aka Tara',
      'saccoRemittanceLedger': 'Littafin Rage-rage',
      'emergencyLiquidity': 'Kudin Gaggawa na Nan Take',
      'perTripDeduction': 'Rage-rage na Kowane Tafiya',
    },
  };
}

class _CabiLocalizationsDelegate
    extends LocalizationsDelegate<CabiLocalizations> {
  const _CabiLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return CabiLocalizations.supportedLanguages
        .any((lang) => lang.code == locale.languageCode);
  }

  @override
  Future<CabiLocalizations> load(Locale locale) {
    return SynchronousFuture<CabiLocalizations>(CabiLocalizations(locale));
  }

  @override
  bool shouldReload(_CabiLocalizationsDelegate old) => false;
}

/// Convenience extension on BuildContext for quick l10n access.
extension CabiLocalizationsExtension on BuildContext {
  CabiLocalizations get l10n => CabiLocalizations.of(this);
}
