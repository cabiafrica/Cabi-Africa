export type SupportedLang = 'en' | 'sw' | 'fr' | 'ar';

export interface WordTranslation {
    source: string;
    translated: string;
}

export interface TranslationResult {
    sourceText: string;
    targetLang: SupportedLang;
    contextualTranslation: string;
    wordByWord: WordTranslation[];
    engine: 'external' | 'dictionary';
}

export const PHRASE_MAP: Record<string, Record<SupportedLang, string>> = {
    'home': { en: 'Home', sw: 'Nyumbani', fr: 'Accueil', ar: 'الرئيسية' },
    'intel': { en: 'Intel', sw: 'Habari', fr: 'Infos', ar: 'الأخبار' },
    'about us': { en: 'About Us', sw: 'Kuhusu Sisi', fr: 'À Propos', ar: 'من نحن' },
    'download app': { en: 'Download App', sw: 'Pakua Programu', fr: 'Télécharger', ar: 'تحميل التطبيق' },
    'sign in': { en: 'Authenticate', sw: 'Thibitisha', fr: 'S’authentifier', ar: 'المصادقة' },
    'authenticate': { en: 'Authenticate', sw: 'Thibitisha', fr: 'S’authentifier', ar: 'المصادقة' },
    'credentials mismatch': { en: 'Credentials mismatch', sw: 'Hitilafu ya kitambulisho na nenosiri', fr: 'Incohérence des identifiants', ar: 'عدم تطابق بيانات الاعتماد' },
    'official passport photo': { en: 'Official Passport Photo', sw: 'Picha Rasmi ya Pasipoti', fr: 'Photo d’Identité Officielle', ar: 'صورة جواز السفر الرسمية' },
    'biometric face scan': { en: 'Biometric Face Scan', sw: 'Uchanganuzi wa Uso wa Kibayometriki', fr: 'Scan Facial Biométrique', ar: 'مسح الوجه البيومتري' },
    'pinpoint on interactive map': { en: 'Pinpoint on Interactive Map', sw: 'Weka Alama Kwenye Ramani', fr: 'Épingler sur la Carte Interactive', ar: 'تحديد النقطة على الخريطة' },
    'get started': { en: 'Get Started', sw: 'Anza Sasa', fr: 'Commencer', ar: 'ابدأ الآن' },
    'elevate your journey.': { en: 'Elevate Your Journey.', sw: 'Boresha Safari Yako.', fr: 'Élevez Votre Trajet.', ar: 'ارتقِ برحلتك.' },
    'executive african mobility': { en: 'Executive African Mobility', sw: 'Usafiri wa Kifahari Afrika', fr: 'Mobilité Exécutive Africaine', ar: 'التنقل التنفيذي في أفريقيا' },
    'book a ride now': { en: 'Book a Ride Now', sw: 'Agiza Safari Sasa', fr: 'Réserver Maintenant', ar: 'احجز رحلة الآن' },
    'for drivers': { en: 'For Drivers', sw: 'Kwa Madereva', fr: 'Pour Captains', ar: 'للسائقين' },
    'how it works': { en: 'How It Works', sw: 'Jinsi Inavyofanya Kazi', fr: 'Comment Ça Marche', ar: 'كيف يعمل' },
    'pickup location': { en: 'Pickup Location', sw: 'Mahali pa Kuchukuliwa', fr: 'Lieu de Prise en Charge', ar: 'موقع الالتقاء' },
    'drop-off destination': { en: 'Drop-off Destination', sw: 'Mahali pa Kushukia', fr: 'Destination', ar: 'وجهة الوصول' },
    'destination': { en: 'Destination', sw: 'Unakoenda', fr: 'Destination', ar: 'الوجهة' },
    'compute trajectory': { en: 'Compute Trajectory', sw: 'Kokotoa Njia', fr: 'Calculer le Trajet', ar: 'حساب المسار' },
    'requesting this ride for someone else?': {
        en: 'Requesting this ride for someone else?',
        sw: 'Je, unaomba safari hii kwa ajili ya mtu mwingine?',
        fr: 'Commander cette course pour quelqu’un d’autre ?',
        ar: 'هل تطلب هذه الرحلة لشخص آخر؟',
    },
    'live gps': { en: 'Live GPS', sw: 'GPS ya Moja kwa Moja', fr: 'GPS en Direct', ar: 'GPS مباشر' },
    'pin on map': { en: 'Pin on Map', sw: 'Weka Alama Kwenye Ramani', fr: 'Épingler sur la Carte', ar: 'تحديد على الخريطة' },
    'voice of the ecosystem.': { en: 'Voice of the Ecosystem.', sw: 'Sauti ya Mfumo Wetu.', fr: 'La Voix de l’Écosystème.', ar: 'صوت المنظومة.' },
    'satisfied users': { en: 'Satisfied Users', sw: 'Watumiaji Walioridhika', fr: 'Utilisateurs Satisfaits', ar: 'مستخدمون راضون' },
    'how will you use cabi?': { en: 'How will you use Cabi?', sw: 'Utatumiaje Cabi?', fr: 'Comment utiliserez-vous Cabi ?', ar: 'كيف ستستخدم كابي؟' },
    'choose your journey type to get started.': {
        en: 'Choose your journey type to get started.',
        sw: 'Chagua aina ya safari yako ili kuanza.',
        fr: 'Choisissez votre type de trajet pour commencer.',
        ar: 'اختر نوع رحلتك للبدء.',
    },
    'passenger': { en: 'Passenger', sw: 'Abiria', fr: 'Passager', ar: 'راكب' },
    'driver': { en: 'Driver', sw: 'Dereva', fr: 'Captain', ar: 'سائق' },
    'vehicle owner': { en: 'Vehicle Owner', sw: 'Mmiliki wa Gari', fr: 'Propriétaire de Véhicule', ar: 'مالك المركبة' },
    'corporate': { en: 'Corporate', sw: 'Kampuni', fr: 'Entreprise', ar: 'شركات' },
    'book an appointment.': { en: 'Book an Appointment.', sw: 'Weka Miadi ya Ofisi.', fr: 'Prendre Rendez-vous.', ar: 'احجز موعداً.' },
    'visit our office': { en: 'Visit Our Office', sw: 'Tembelea Ofisi Yetu', fr: 'Visiter Notre Bureau', ar: 'زر مكتبنا' },
    'lost & found': { en: 'Lost & Found', sw: 'Vitu Vilivyopotea na Kupatikana', fr: 'Objets Trouvés', ar: 'المفقودات والمعثورات' },
    '7-day office custody policy': {
        en: '7-Day Office Custody Policy',
        sw: 'Sera ya Siku 7 ya Kuhifadhi Ofisini',
        fr: 'Politique de Garde de 7 Jours',
        ar: 'سياسة الحفظ في المكتب لمدة 7 أيام',
    },
    'short description *': { en: 'Short Description *', sw: 'Maelezo Mafupi *', fr: 'Brève Description *', ar: 'وصف قصير *' },
    'submit lost & found': { en: 'Submit Lost & Found', sw: 'Wasilisha Taarifa', fr: 'Soumettre', ar: 'إرسال البلاغ' },
    'recent lost & found items': { en: 'Recent Lost & Found Items', sw: 'Vitu vya Hivi Karibuni', fr: 'Objets Récents', ar: 'أحدث المفقودات' },
    'no lost or found items reported yet.': {
        en: 'No lost or found items reported yet.',
        sw: 'Hakuna vitu vilivyopotea au kupatikana vilivyoripotiwa bado.',
        fr: 'Aucun objet perdu ou trouvé signalé pour le moment.',
        ar: 'لم يتم الإبلاغ عن أي مفقودات بعد.',
    },
    'driver concierge': { en: 'Driver Concierge', sw: 'Huduma ya Msaidizi wa Dereva', fr: 'Conciergerie Captain', ar: 'خدمة كونسيرج السائق' },
    'precision captain & urban transit across africa.': {
        en: 'Precision Captain & Urban Transit across Africa.',
        sw: 'Huduma Bora ya Dereva na Usafiri wa Mijini Barani Afrika.',
        fr: 'Captain de Précision & Transit Urbain en Afrique.',
        ar: 'سائقون محترفون ونقل حضري دقيق في جميع أنحاء أفريقيا.',
    },
    'book your ride': {
        en: 'Book Your Ride',
        sw: 'Agiza Safari Yako',
        fr: 'Réservez Votre Trajet',
        ar: 'احجز رحلتك',
    },
    'neural deployment unit': {
        en: 'Book Your Ride',
        sw: 'Kitengo cha Kuelekeza Safari',
        fr: 'Unité de Déploiement',
        ar: 'وحدة التوجيه الذكي',
    },
    'flagship fleet selection': {
        en: 'Flagship Fleet Selection',
        sw: 'Uchaguzi wa Magari Bora',
        fr: 'Sélection de Flotte Phare',
        ar: 'تشكيلة الأسطول الرائدة',
    },
    'drive & earn on your terms': {
        en: 'Drive & Earn on Your Terms',
        sw: 'Endesha na Upate Mapato kwa Masharti Yako',
        fr: 'Conduisez et Gagnez à Vos Conditions',
        ar: 'قد واربح بشروطك الخاصة',
    },
    'ride in comfort & style': {
        en: 'Ride in Comfort & Style',
        sw: 'Safiri kwa Starehe na Mtindo',
        fr: 'Voyagez avec Confort et Style',
        ar: 'تنقل براحة وأناقة',
    },
    'latest intel.': { en: 'Latest Intel.', sw: 'Habari za Hivi Punde.', fr: 'Dernières Infos.', ar: 'أحدث الأخبار.' },
    'connect with cabi.': { en: 'Connect with CABI.', sw: 'Wasiliana na CABI.', fr: 'Contactez CABI.', ar: 'تواصل مع كابي.' },
    'already have an account?': { en: 'Already have an account?', sw: 'Tayari una akaunti?', fr: 'Vous avez déjà un compte ?', ar: 'هل لديك حساب بالفعل؟' },
    'log in': { en: 'Log In', sw: 'Ingia', fr: 'Se Connecter', ar: 'تسجيل الدخول' },
    'download menu': { en: 'Download Menu', sw: 'Menyu ya Kupakua', fr: 'Menu de Téléchargement', ar: 'قائمة التحميل' },
    'mobility ecosystem': { en: 'Mobility Ecosystem', sw: 'Mfumo wa Usafiri', fr: 'Écosystème de Mobilité', ar: 'منظومة التنقل' },
    'company & portals': { en: 'Company & Portals', sw: 'Kampuni na Milango', fr: 'Entreprise & Portails', ar: 'الشركة والبوابات' },
    'support & legal': { en: 'Support & Legal', sw: 'Msaada na Sheria', fr: 'Support & Légal', ar: 'الدعم والشؤون القانونية' },
    'where are you going?': { en: 'Where are you going?', sw: 'Unaenda wapi?', fr: 'Où allez-vous ?', ar: 'إلى أين تذهب؟' },
    'i am at the pickup point': { en: 'I am at the pickup point', sw: 'Niko mahali pa kuchukuliwa', fr: 'Je suis au point de prise en charge', ar: 'أنا في نقطة الالتقاء' },
    'please wait for me': { en: 'Please wait for me', sw: 'Tafadhali nisubiri', fr: 'Veuillez m’attendre', ar: 'من فضلك انتظرني' },
    'i left my phone in the car': { en: 'I left my phone in the car', sw: 'Niliacha simu yangu garini', fr: 'J’ai laissé mon téléphone dans la voiture', ar: 'تركت هاتفي في السيارة' },
    'i found an item in my vehicle': { en: 'I found an item in my vehicle', sw: 'Nilipata kitu kwenye gari langu', fr: 'J’ai trouvé un objet dans mon véhicule', ar: 'وجدت غرضاً في سيارتي' },
};

export const WORD_DICTIONARY: Record<string, Record<SupportedLang, string>> = {
    hello: { en: 'hello', sw: 'habari', fr: 'bonjour', ar: 'مرحبا' },
    please: { en: 'please', sw: 'tafadhali', fr: 's’il vous plaît', ar: 'من فضلك' },
    thank: { en: 'thank', sw: 'asante', fr: 'merci', ar: 'شكراً' },
    thanks: { en: 'thanks', sw: 'asante', fr: 'merci', ar: 'شكراً' },
    you: { en: 'you', sw: 'wewe', fr: 'vous', ar: 'أنت' },
    your: { en: 'your', sw: 'yako', fr: 'votre', ar: 'لك' },
    our: { en: 'our', sw: 'yetu', fr: 'notre', ar: 'لنا' },
    i: { en: 'I', sw: 'mimi', fr: 'je', ar: 'أنا' },
    am: { en: 'am', sw: 'niko', fr: 'suis', ar: 'أكون' },
    at: { en: 'at', sw: 'kwa', fr: 'à', ar: 'في' },
    in: { en: 'in', sw: 'katika', fr: 'dans', ar: 'في' },
    on: { en: 'on', sw: 'kwenye', fr: 'sur', ar: 'على' },
    for: { en: 'for', sw: 'kwa', fr: 'pour', ar: 'لـ' },
    with: { en: 'with', sw: 'na', fr: 'avec', ar: 'مع' },
    and: { en: 'and', sw: 'na', fr: 'et', ar: 'و' },
    or: { en: 'or', sw: 'au', fr: 'ou', ar: 'أو' },
    the: { en: 'the', sw: 'hii', fr: 'le', ar: 'ال' },
    book: { en: 'book', sw: 'agiza', fr: 'réserver', ar: 'احجز' },
    now: { en: 'now', sw: 'sasa', fr: 'maintenant', ar: 'الآن' },
    pickup: { en: 'pickup', sw: 'kuchukuliwa', fr: 'prise en charge', ar: 'الالتقاء' },
    location: { en: 'location', sw: 'mahali', fr: 'emplacement', ar: 'الموقع' },
    destination: { en: 'destination', sw: 'unakoenda', fr: 'destination', ar: 'الوجهة' },
    driver: { en: 'driver', sw: 'dereva', fr: 'captain', ar: 'السائق' },
    drivers: { en: 'drivers', sw: 'madereva', fr: 'captains', ar: 'السائقون' },
    passenger: { en: 'passenger', sw: 'abiria', fr: 'passager', ar: 'الراكب' },
    passengers: { en: 'passengers', sw: 'abiria', fr: 'passagers', ar: 'الركاب' },
    car: { en: 'car', sw: 'gari', fr: 'voiture', ar: 'سيارة' },
    vehicle: { en: 'vehicle', sw: 'gari', fr: 'véhicule', ar: 'مركبة' },
    vehicles: { en: 'vehicles', sw: 'magari', fr: 'véhicules', ar: 'مركبات' },
    ride: { en: 'ride', sw: 'safari', fr: 'trajet', ar: 'رحلة' },
    rides: { en: 'rides', sw: 'safari', fr: 'trajets', ar: 'رحلات' },
    trip: { en: 'trip', sw: 'safari', fr: 'voyage', ar: 'رحلة' },
    wait: { en: 'wait', sw: 'subiri', fr: 'attendez', ar: 'انتظر' },
    here: { en: 'here', sw: 'hapa', fr: 'ici', ar: 'هنا' },
    office: { en: 'office', sw: 'ofisi', fr: 'bureau', ar: 'المكتب' },
    lost: { en: 'lost', sw: 'kilichopotea', fr: 'perdu', ar: 'مفقود' },
    found: { en: 'found', sw: 'kilichopatikana', fr: 'trouvé', ar: 'موجود' },
    item: { en: 'item', sw: 'kitu', fr: 'objet', ar: 'غرض' },
    items: { en: 'items', sw: 'vitu', fr: 'objets', ar: 'أغراض' },
    phone: { en: 'phone', sw: 'simu', fr: 'téléphone', ar: 'هاتف' },
    email: { en: 'email', sw: 'barua pepe', fr: 'e-mail', ar: 'البريد الإلكتروني' },
    name: { en: 'name', sw: 'jina', fr: 'nom', ar: 'الاسم' },
    bag: { en: 'bag', sw: 'mfuko', fr: 'sac', ar: 'حقيبة' },
    wallet: { en: 'wallet', sw: 'pochi', fr: 'portefeuille', ar: 'محفظة' },
    keys: { en: 'keys', sw: 'funguo', fr: 'clés', ar: 'مفاتيح' },
    days: { en: 'days', sw: 'siku', fr: 'jours', ar: 'أيام' },
    date: { en: 'date', sw: 'tarehe', fr: 'date', ar: 'التاريخ' },
    time: { en: 'time', sw: 'muda', fr: 'heure', ar: 'الوقت' },
    confirm: { en: 'confirm', sw: 'thibitisha', fr: 'confirmer', ar: 'تأكيد' },
    cancel: { en: 'cancel', sw: 'ghairi', fr: 'annuler', ar: 'إلغاء' },
    submit: { en: 'submit', sw: 'wasilisha', fr: 'soumettre', ar: 'إرسال' },
    send: { en: 'send', sw: 'tuma', fr: 'envoyer', ar: 'إرسال' },
    save: { en: 'save', sw: 'hifadhi', fr: 'enregistrer', ar: 'حفظ' },
    pay: { en: 'pay', sw: 'lipa', fr: 'payer', ar: 'ادفع' },
    topup: { en: 'topup', sw: 'ongeza salio', fr: 'recharger', ar: 'شحن' },
    payout: { en: 'payout', sw: 'malipo', fr: 'paiement', ar: 'سحب' },
    settings: { en: 'settings', sw: 'mipangilio', fr: 'paramètres', ar: 'الإعدادات' },
    profile: { en: 'profile', sw: 'wasifu', fr: 'profil', ar: 'الملف الشخصي' },
    concierge: { en: 'concierge', sw: 'msaidizi', fr: 'conciergerie', ar: 'الكونسيرج' },
    appointment: { en: 'appointment', sw: 'miadi', fr: 'rendez-vous', ar: 'موعد' },
    appointments: { en: 'appointments', sw: 'miadi', fr: 'rendez-vous', ar: 'مواعيد' },
    register: { en: 'register', sw: 'sajili', fr: 's’inscrire', ar: 'تسجيل' },
    registration: { en: 'registration', sw: 'usajili', fr: 'inscription', ar: 'التسجيل' },
    password: { en: 'password', sw: 'nenosiri', fr: 'mot de passe', ar: 'كلمة المرور' },
    reset: { en: 'reset', sw: 'weka upya', fr: 'réinitialiser', ar: 'إعادة تعيين' },
    fleet: { en: 'fleet', sw: 'kundi la magari', fr: 'flotte', ar: 'الأسطول' },
    contact: { en: 'contact', sw: 'wasiliana', fr: 'contact', ar: 'اتصل' },
    download: { en: 'download', sw: 'pakua', fr: 'télécharger', ar: 'تحميل' },
    learn: { en: 'learn', sw: 'jifunze', fr: 'apprendre', ar: 'تعلم' },
    more: { en: 'more', sw: 'zaidi', fr: 'plus', ar: 'المزيد' },
    read: { en: 'read', sw: 'soma', fr: 'lire', ar: 'اقرأ' },
    article: { en: 'article', sw: 'makala', fr: 'article', ar: 'مقال' },
    view: { en: 'view', sw: 'tazama', fr: 'voir', ar: 'عرض' },
    all: { en: 'all', sw: 'zote', fr: 'tous', ar: 'الكل' },
    support: { en: 'support', sw: 'msaada', fr: 'assistance', ar: 'الدعم' },
    safety: { en: 'safety', sw: 'usalama', fr: 'sécurité', ar: 'السلامة' },
    privacy: { en: 'privacy', sw: 'faragha', fr: 'confidentialité', ar: 'الخصوصية' },
    terms: { en: 'terms', sw: 'masharti', fr: 'conditions', ar: 'الشروط' },
    language: { en: 'language', sw: 'lugha', fr: 'langue', ar: 'اللغة' },
    hours: { en: 'hours', sw: 'masaa', fr: 'heures', ar: 'ساعات' },
    description: { en: 'description', sw: 'maelezo', fr: 'description', ar: 'الوصف' },
    how: { en: 'how', sw: 'jinsi', fr: 'comment', ar: 'كيف' },
    will: { en: 'will', sw: 'uta', fr: 'allez', ar: 'سوف' },
    use: { en: 'use', sw: 'tumia', fr: 'utiliser', ar: 'استخدام' },
    choose: { en: 'choose', sw: 'chagua', fr: 'choisir', ar: 'اختر' },
    journey: { en: 'journey', sw: 'safari', fr: 'parcours', ar: 'رحلة' },
    type: { en: 'type', sw: 'aina', fr: 'type', ar: 'نوع' },
    to: { en: 'to', sw: 'ili', fr: 'pour', ar: 'لـ' },
    get: { en: 'get', sw: 'pata', fr: 'obtenir', ar: 'احصل' },
    started: { en: 'started', sw: 'anza', fr: 'commencer', ar: 'ابدأ' },
    start: { en: 'start', sw: 'anza', fr: 'commencer', ar: 'ابدأ' },
    an: { en: 'an', sw: 'hii', fr: 'un', ar: 'ال' },
    a: { en: 'a', sw: 'ya', fr: 'un', ar: 'ال' },
    is: { en: 'is', sw: 'ni', fr: 'est', ar: 'هو' },
    are: { en: 'are', sw: 'ni', fr: 'sont', ar: 'هم' },
    was: { en: 'was', sw: 'ilikuwa', fr: 'était', ar: 'كان' },
    be: { en: 'be', sw: 'kuwa', fr: 'être', ar: 'يكون' },
    can: { en: 'can', sw: 'inaweza', fr: 'peut', ar: 'يمكن' },
    have: { en: 'have', sw: 'kuwa na', fr: 'avoir', ar: 'لديك' },
    has: { en: 'has', sw: 'ina', fr: 'a', ar: 'لديه' },
    this: { en: 'this', sw: 'hii', fr: 'ceci', ar: 'هذا' },
    that: { en: 'that', sw: 'hiyo', fr: 'cela', ar: 'ذلك' },
    from: { en: 'from', sw: 'kutoka', fr: 'de', ar: 'من' },
    by: { en: 'by', sw: 'na', fr: 'par', ar: 'بواسطة' },
    of: { en: 'of', sw: 'ya', fr: 'de', ar: 'من' },
    no: { en: 'no', sw: 'hakuna', fr: 'aucun', ar: 'لا' },
    not: { en: 'not', sw: 'si', fr: 'pas', ar: 'ليس' },
    yet: { en: 'yet', sw: 'bado', fr: 'encore', ar: 'بعد' },
    need: { en: 'need', sw: 'hitaji', fr: 'besoin', ar: 'تحتاج' },
    within: { en: 'within', sw: 'ndani ya', fr: 'dans', ar: 'خلال' },
    below: { en: 'below', sw: 'hapa chini', fr: 'ci-dessous', ar: 'أدناه' },
    above: { en: 'above', sw: 'hapo juu', fr: 'ci-dessus', ar: 'أعلاه' },
    back: { en: 'back', sw: 'rudi', fr: 'retour', ar: 'رجوع' },
    visit: { en: 'visit', sw: 'tembelea', fr: 'visiter', ar: 'زيارة' },
    select: { en: 'select', sw: 'chagua', fr: 'sélectionner', ar: 'اختر' },
    preferred: { en: 'preferred', sw: 'inayopendelewa', fr: 'préféré', ar: 'المفضل' },
    optional: { en: 'optional', sw: 'hiari', fr: 'optionnel', ar: 'اختياري' },
    notes: { en: 'notes', sw: 'maelezo', fr: 'notes', ar: 'ملاحظات' },
    full: { en: 'full', sw: 'kamili', fr: 'complet', ar: 'كامل' },
    short: { en: 'short', sw: 'fupi', fr: 'court', ar: 'قصير' },
    recent: { en: 'recent', sw: 'za hivi karibuni', fr: 'récent', ar: 'حديث' },
    reported: { en: 'reported', sw: 'zilizoripotiwa', fr: 'signalé', ar: 'مبلغ عنها' },
    policy: { en: 'policy', sw: 'sera', fr: 'politique', ar: 'سياسة' },
    custody: { en: 'custody', sw: 'uhifadhi', fr: 'garde', ar: 'حفظ' },
    collect: { en: 'collect', sw: 'chukua', fr: 'récupérer', ar: 'استلام' },
    drop: { en: 'drop', sw: 'weka', fr: 'déposer', ar: 'إيداع' },
    communication: { en: 'communication', sw: 'mawasiliano', fr: 'communication', ar: 'تواصل' },
    directly: { en: 'directly', sw: 'moja kwa moja', fr: 'directement', ar: 'مباشرة' },
    already: { en: 'already', sw: 'tayari', fr: 'déjà', ar: 'بالفعل' },
    account: { en: 'account', sw: 'akaunti', fr: 'compte', ar: 'حساب' },
    log: { en: 'log', sw: 'ingia', fr: 'connexion', ar: 'دخول' },
    owner: { en: 'owner', sw: 'mmiliki', fr: 'propriétaire', ar: 'مالك' },
    corporate: { en: 'corporate', sw: 'kampuni', fr: 'entreprise', ar: 'شركة' },
    business: { en: 'business', sw: 'biashara', fr: 'affaires', ar: 'أعمال' },
    earn: { en: 'earn', sw: 'pata mapato', fr: 'gagner', ar: 'اربح' },
    apply: { en: 'apply', sw: 'omba', fr: 'postuler', ar: 'تقدم' },
    menu: { en: 'menu', sw: 'menyu', fr: 'menu', ar: 'القائمة' },
    ecosystem: { en: 'ecosystem', sw: 'mfumo', fr: 'écosystème', ar: 'المنظومة' },
    company: { en: 'company', sw: 'kampuni', fr: 'entreprise', ar: 'الشركة' },
    portals: { en: 'portals', sw: 'milango', fr: 'portails', ar: 'البوابات' },
    legal: { en: 'legal', sw: 'sheria', fr: 'légal', ar: 'قانوني' },
    users: { en: 'users', sw: 'watumiaji', fr: 'utilisateurs', ar: 'المستخدمون' },
    satisfied: { en: 'satisfied', sw: 'walioridhika', fr: 'satisfaits', ar: 'راضون' },
    voice: { en: 'voice', sw: 'sauti', fr: 'voix', ar: 'صوت' },
    comfort: { en: 'comfort', sw: 'starehe', fr: 'confort', ar: 'راحة' },
    style: { en: 'style', sw: 'mtindo', fr: 'style', ar: 'أناقة' },
    precision: { en: 'precision', sw: 'usahihi', fr: 'précision', ar: 'دقة' },
    urban: { en: 'urban', sw: 'mijini', fr: 'urbain', ar: 'حضري' },
    transit: { en: 'transit', sw: 'usafiri', fr: 'transit', ar: 'نقل' },
    across: { en: 'across', sw: 'kote', fr: 'à travers', ar: 'عبر' },
    africa: { en: 'africa', sw: 'Afrika', fr: 'Afrique', ar: 'أفريقيا' },
    request: { en: 'request', sw: 'omba', fr: 'demander', ar: 'اطلب' },
    someone: { en: 'someone', sw: 'mtu', fr: 'quelqu’un', ar: 'شخص' },
    else: { en: 'else', sw: 'mwingine', fr: 'autre', ar: 'آخر' },
    live: { en: 'live', sw: 'moja kwa moja', fr: 'en direct', ar: 'مباشر' },
    address: { en: 'address', sw: 'anwani', fr: 'adresse', ar: 'عنوان' },
    number: { en: 'number', sw: 'nambari', fr: 'numéro', ar: 'رقم' },
    purpose: { en: 'purpose', sw: 'madhumuni', fr: 'objet', ar: 'الغرض' },
    available: { en: 'available', sw: 'inapatikana', fr: 'disponible', ar: 'متاح' },
    slots: { en: 'slots', sw: 'nafasi', fr: 'créneaux', ar: 'فترات' },
    working: { en: 'working', sw: 'kazi', fr: 'travail', ar: 'عمل' },
    closed: { en: 'closed', sw: 'imefungwa', fr: 'fermé', ar: 'مغلق' },
    open: { en: 'open', sw: 'wazi', fr: 'ouvert', ar: 'مفتوح' },
    direct: { en: 'direct', sw: 'moja kwa moja', fr: 'direct', ar: 'مباشر' },
    desk: { en: 'desk', sw: 'dawati', fr: 'bureau', ar: 'مكتب' },
};

export function translatePhraseOrWordsSync(text: string, targetLang: SupportedLang): string {
    if (targetLang === 'en') return text;
    const trimmed = text.trim();
    if (!trimmed) return text;

    const exact = PHRASE_MAP[trimmed.toLowerCase()]?.[targetLang];
    if (exact) return exact;

    // Word-by-word fallback preserving punctuation/whitespace
    return text.replace(/\b[A-Za-z]+\b/g, (word, offset, fullStr) => {
        // Never translate time suffixes like "AM", "PM", "8AM", or acronyms like "CABI", "GPS", "PSV", "OTP", "SMS"
        if (word === 'AM' || word === 'PM' || /^\d/.test(fullStr.slice(Math.max(0, offset - 1), offset))) {
            return word;
        }
        if (word.length >= 2 && word === word.toUpperCase() && !['HOME', 'INTEL', 'MENU'].includes(word)) {
            return word;
        }
        const mapped = WORD_DICTIONARY[word.toLowerCase()]?.[targetLang];
        if (!mapped) return word;
        if (word[0] === word[0].toUpperCase()) {
            return mapped.charAt(0).toUpperCase() + mapped.slice(1);
        }
        return mapped;
    });
}

const NMT_MEMORY_CACHE = new Map<string, string>();

async function callPremadeNmt(text: string, targetLang: SupportedLang): Promise<string | null> {
    if (!text.trim() || targetLang === 'en') return text;
    const cacheKey = `${targetLang}:${text}`;
    const cached = NMT_MEMORY_CACHE.get(cacheKey);
    if (cached) return cached;

    // 1. Official Google Cloud Translation v2 (if API key configured)
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (googleApiKey) {
        try {
            const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(googleApiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: text, target: targetLang, format: 'text' }),
            });
            if (res.ok) {
                const data = await res.json();
                const translated = data?.data?.translations?.[0]?.translatedText;
                if (translated) {
                    NMT_MEMORY_CACHE.set(cacheKey, translated);
                    return translated;
                }
            }
        } catch {
            // Fall through
        }
    }

    // 2. LibreTranslate (if configured)
    const libreUrl = process.env.LIBRETRANSLATE_URL;
    if (libreUrl) {
        try {
            const res = await fetch(`${libreUrl.replace(/\/+$/, '')}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: text, source: 'auto', target: targetLang, format: 'text' }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.translatedText) {
                    NMT_MEMORY_CACHE.set(cacheKey, data.translatedText);
                    return data.translatedText;
                }
            }
        } catch {
            // Fall through
        }
    }

    // 3. Premade Google Translate GTX NMT endpoint (zero-config fallback)
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.[0])) {
                const translated = data[0].map((seg: any) => seg?.[0] || '').join('').trim();
                if (translated) {
                    NMT_MEMORY_CACHE.set(cacheKey, translated);
                    return translated;
                }
            }
        }
    } catch {
        // Fall through to dictionary
    }

    return null;
}

export async function translateBatchContextual(
    texts: string[],
    targetLang: SupportedLang
): Promise<Record<string, string>> {
    const unique = Array.from(new Set(texts.map((t) => t.trim()).filter(Boolean)));
    const result: Record<string, string> = {};
    if (targetLang === 'en' || unique.length === 0) {
        for (const t of unique) result[t] = t;
        return result;
    }

    await Promise.all(
        unique.map(async (item) => {
            const exact = PHRASE_MAP[item.toLowerCase()]?.[targetLang];
            if (exact) {
                result[item] = exact;
                return;
            }
            const nmt = await callPremadeNmt(item, targetLang);
            result[item] = nmt || translatePhraseOrWordsSync(item, targetLang);
        })
    );

    return result;
}

export async function translateTextWithBreakdown(
    text: string,
    targetLang: SupportedLang
): Promise<TranslationResult> {
    const clean = text.trim();
    const tokens = clean.split(/\s+/).filter(Boolean);

    const wordByWord: WordTranslation[] = await Promise.all(
        tokens.map(async (token) => {
            const stripped = token.toLowerCase().replace(/[^a-z0-9]/g, '');
            const dictMapped = WORD_DICTIONARY[stripped]?.[targetLang];
            if (dictMapped) return { source: token, translated: dictMapped };
            const nmtWord = targetLang === 'en' ? token : await callPremadeNmt(token, targetLang);
            return { source: token, translated: nmtWord || token };
        })
    );

    const phraseMatch = PHRASE_MAP[clean.toLowerCase()]?.[targetLang];
    if (phraseMatch) {
        return {
            sourceText: clean,
            targetLang,
            contextualTranslation: phraseMatch,
            wordByWord,
            engine: 'dictionary',
        };
    }

    const nmtFull = await callPremadeNmt(clean, targetLang);
    if (nmtFull) {
        return {
            sourceText: clean,
            targetLang,
            contextualTranslation: nmtFull,
            wordByWord,
            engine: 'external',
        };
    }

    return {
        sourceText: clean,
        targetLang,
        contextualTranslation: wordByWord.map((w) => w.translated).join(' '),
        wordByWord,
        engine: 'dictionary',
    };
}
