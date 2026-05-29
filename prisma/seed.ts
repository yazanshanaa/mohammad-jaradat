import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Admin User
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'password123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@solarpro.ps' },
    update: { 
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      plan: 'ENTERPRISE',
      companyName: 'SolarPro HQ',
    },
    create: {
      email: 'admin@solarpro.ps',
      password: hashedPassword,
      name: 'مدير النظام',
      role: 'SUPER_ADMIN',
      plan: 'ENTERPRISE',
      companyName: 'SolarPro HQ',
    },
  });
  console.log(`✅ Admin user ready: ${admin.id}`);

  const userId = admin.id;

  // 2. Calculator Config
  // Note: key is now composite or userId is unique
  await prisma.calculatorConfig.upsert({
    where: { userId: userId },
    update: {},
    create: {
      userId: userId,
      averageSunHoursPerDay: 5.5,
      panelWatts: 550,
      inverterEfficiency: 0.96,
      systemLoss: 0.14,
      pricePerKwhIls: 0.70,
      pricePerWattInstalled: 4.50,
      panelPriceIls: 400,
      inverterPriceBase: 3500,
      batteryPricePerKwh: 2200,
      systemLifeYears: 25,
      annualDegradation: 0.005,
      co2PerKwh: 0.49,
    },
  });
  console.log('✅ Calculator config created');

  // 3. Solar Systems
  const systems = [
    {
      slug: 'on-grid-system',
      titleAr: 'نظام متصل بالشبكة (On-Grid)',
      titleEn: 'On-Grid Solar System',
      descriptionAr:
        'أفضل حل لتوفير الكهرباء مع الإبقاء على الاتصال بشبكة الكهرباء العامة. يتيح لك بيع الفائض إلى الشركة وتوفير فاتورتك بنسبة تصل إلى 90%.',
      descriptionEn:
        'The best solution for saving electricity while staying connected to the public grid. Allows you to sell excess energy and save up to 90% on electricity bill.',
      type: 'ON_GRID' as const,
      features: {
        create: [
          { textAr: 'توفير حتى 90% من الفاتورة', textEn: 'Save up to 90% on electricity bills' },
          { textAr: 'بيع الفائض للشبكة', textEn: 'Sell excess energy to the grid' },
          { textAr: 'لا حاجة لبطاريات', textEn: 'No batteries needed' },
          { textAr: 'صيانة منخفضة', textEn: 'Low maintenance' },
          { textAr: 'ضمان 25 سنة على الألواح', textEn: '25-year panel warranty' },
        ]
      },
      specs: {
        create: [
          { labelAr: 'نوع الألواح', labelEn: 'Panel Type', valueAr: 'Monocrystalline 550W', valueEn: 'Monocrystalline 550W' },
          { labelAr: 'نوع الإنفرتر', labelEn: 'Inverter Type', valueAr: 'سلسلة إنفرتر', valueEn: 'String Inverter' },
          { labelAr: 'الكفاءة', labelEn: 'Efficiency', valueAr: '96%', valueEn: '96%' },
          { labelAr: 'الضمان', labelEn: 'Warranty', valueAr: '25 سنة', valueEn: '25 years' },
        ]
      },
      minPower: 3000,
      maxPower: 100000,
      pricePerWatt: 4.5,
      coverImage: '/images/systems/on-grid.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: 'off-grid-system',
      titleAr: 'نظام منفصل عن الشبكة (Off-Grid)',
      titleEn: 'Off-Grid Solar System',
      descriptionAr:
        'الحل الأمثل للمناطق البعيدة أو المزارع التي لا تصلها شبكة الكهرباء. يعمل باستقلالية تامة مع بطاريات تخزين تكفي لساعات الليل.',
      descriptionEn:
        'The ideal solution for remote areas or farms without grid access. Operates completely independently with storage batteries for nighttime use.',
      type: 'OFF_GRID' as const,
      features: {
        create: [
          { textAr: 'استقلالية تامة عن الشبكة', textEn: 'Complete grid independence' },
          { textAr: 'مثالي للمناطق النائية', textEn: 'Ideal for remote areas' },
          { textAr: 'بطاريات تخزين عالية السعة', textEn: 'High-capacity storage batteries' },
          { textAr: 'يعمل 24/7 بدون انقطاع', textEn: 'Operates 24/7 without interruption' },
          { textAr: 'حماية من انقطاع التيار', textEn: 'Protection from power outages' },
        ]
      },
      specs: {
        create: [
          { labelAr: 'نوع الألواح', labelEn: 'Panel Type', valueAr: 'Monocrystalline 550W', valueEn: 'Monocrystalline 550W' },
          { labelAr: 'نوع الإنفرتر', labelEn: 'Inverter Type', valueAr: 'هجين', valueEn: 'Hybrid Inverter' },
          { labelAr: 'نوع البطارية', labelEn: 'Battery Type', valueAr: 'ليثيوم LiFePO4', valueEn: 'Lithium LiFePO4' },
          { labelAr: 'الكفاءة', labelEn: 'Efficiency', valueAr: '95%', valueEn: '95%' },
        ]
      },
      minPower: 2000,
      maxPower: 50000,
      pricePerWatt: 6.5,
      coverImage: '/images/systems/off-grid.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      slug: 'hybrid-system',
      titleAr: 'النظام الهجين (Hybrid)',
      titleEn: 'Hybrid Solar System',
      descriptionAr:
        'أفضل ما في النظامين معاً — متصل بالشبكة مع بطاريات احتياطية. يوفر الكهرباء في النهار ويخزن الفائض للاستخدام ليلاً أو عند الانقطاع.',
      descriptionEn:
        'The best of both worlds — grid-connected with backup batteries. Saves electricity during the day and stores excess for nighttime or outage use.',
      type: 'HYBRID' as const,
      features: {
        create: [
          { textAr: 'متصل بالشبكة + بطاريات احتياطية', textEn: 'Grid-connected + backup batteries' },
          { textAr: 'لا انقطاع حتى عند انقطاع الكهرباء', textEn: 'No interruption even during outages' },
          { textAr: 'ذكي يدير الطاقة تلقائياً', textEn: 'Smart automatic energy management' },
          { textAr: 'أعلى توفير ممكن', textEn: 'Maximum possible savings' },
          { textAr: 'مناسب للمنازل والأعمال', textEn: 'Suitable for homes and businesses' },
        ]
      },
      specs: {
        create: [
          { labelAr: 'نوع الألواح', labelEn: 'Panel Type', valueAr: 'Monocrystalline 550W', valueEn: 'Monocrystalline 550W' },
          { labelAr: 'نوع الإنفرتر', labelEn: 'Inverter Type', valueAr: 'هجين', valueEn: 'Hybrid Inverter' },
          { labelAr: 'نوع البطارية', labelEn: 'Battery Type', valueAr: 'ليثيوم LiFePO4', valueEn: 'Lithium LiFePO4' },
        ]
      },
      minPower: 5000,
      maxPower: 200000,
      pricePerWatt: 5.5,
      coverImage: '/images/systems/hybrid.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
    },
  ];

  for (const system of systems) {
    await prisma.solarSystem.upsert({
      where: { slug_userId: { slug: system.slug, userId } },
      update: {},
      create: { ...system, userId },
    });
  }
  console.log('✅ Solar systems created');

  // 4. Services
  const services = [
    {
      slug: 'installation',
      titleAr: 'تركيب الأنظمة الشمسية',
      titleEn: 'Solar System Installation',
      shortDescAr: 'تركيب احترافي لأنظمة الطاقة الشمسية بأعلى معايير الجودة',
      shortDescEn: 'Professional solar system installation with highest quality standards',
      descriptionAr: 'نقدم خدمة التركيب الاحترافي لجميع أنواع أنظمة الطاقة الشمسية، من الأنظمة السكنية الصغيرة حتى المشاريع التجارية والصناعية الكبيرة. فريقنا المدرب يضمن أعلى معايير السلامة والجودة.',
      descriptionEn: 'We provide professional installation services for all types of solar energy systems, from small residential to large commercial and industrial projects. Our trained team ensures the highest safety and quality standards.',
      icon: 'Zap',
      features: [
        { ar: 'دراسة موقع مجانية', en: 'Free site survey' },
        { ar: 'تركيب خلال 1-3 أيام', en: 'Installation within 1-3 days' },
        { ar: 'ضمان على التركيب 5 سنوات', en: '5-year installation warranty' },
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: 'maintenance',
      titleAr: 'الصيانة الدورية',
      titleEn: 'Periodic Maintenance',
      shortDescAr: 'برامج صيانة دورية لضمان أعلى كفاءة لنظامك الشمسي',
      shortDescEn: 'Periodic maintenance programs to ensure maximum efficiency of your solar system',
      descriptionAr: 'تضمن برامج الصيانة الدورية لدينا أن نظامك الشمسي يعمل بأعلى كفاءة ممكنة طوال عمره الافتراضي. نوفر خدمات التنظيف والفحص والإصلاح.',
      descriptionEn: 'Our periodic maintenance programs ensure your solar system operates at maximum efficiency throughout its lifetime. We provide cleaning, inspection, and repair services.',
      icon: 'Settings',
      features: [
        { ar: 'تنظيف الألواح شهرياً', en: 'Monthly panel cleaning' },
        { ar: 'فحص الإنفرتر والتوصيلات', en: 'Inverter and connection inspection' },
        { ar: 'تقرير أداء ربع سنوي', en: 'Quarterly performance report' },
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: 'consultation',
      titleAr: 'الاستشارة الفنية',
      titleEn: 'Technical Consultation',
      shortDescAr: 'استشارات فنية متخصصة لاختيار أفضل نظام شمسي لاحتياجاتك',
      shortDescEn: 'Specialized technical consultations to choose the best solar system for your needs',
      descriptionAr: 'فريق خبرائنا الفنيين يقدم استشارات متخصصة لمساعدتك في اتخاذ القرار الصحيح. ندرس احتياجاتك وميزانيتك ونقدم أفضل الحلول.',
      descriptionEn: 'Our technical expert team provides specialized consultations to help you make the right decision. We study your needs and budget and offer the best solutions.',
      icon: 'MessageCircle',
      features: [
        { ar: 'تحليل فاتورتك الكهربائية', en: 'Electricity bill analysis' },
        { ar: 'حساب حجم النظام المطلوب', en: 'System size calculation' },
        { ar: 'دراسة جدوى اقتصادية', en: 'Economic feasibility study' },
      ],
      isActive: true,
      sortOrder: 3,
    },
    {
      slug: 'monitoring',
      titleAr: 'المراقبة الذكية',
      titleEn: 'Smart Monitoring',
      shortDescAr: 'نظام مراقبة ذكي لمتابعة أداء نظامك الشمسي في الوقت الفعلي',
      shortDescEn: 'Smart monitoring system to track your solar system performance in real-time',
      descriptionAr: 'نوفر أنظمة مراقبة متطورة تتيح لك متابعة أداء نظامك الشمسي من خلال تطبيق الهاتف أو المتصفح.',
      descriptionEn: 'We provide advanced monitoring systems that allow you to track your solar system performance through a mobile app or browser.',
      icon: 'Monitor',
      features: [
        { ar: 'مراقبة فورية عبر التطبيق', en: 'Real-time monitoring via app' },
        { ar: 'تنبيهات فورية عند الأعطال', en: 'Instant fault alerts' },
        { ar: 'تقارير الإنتاج التفصيلية', en: 'Detailed production reports' },
      ],
      isActive: true,
      sortOrder: 4,
    },
    {
      slug: 'financing',
      titleAr: 'التمويل والتقسيط',
      titleEn: 'Financing & Installments',
      shortDescAr: 'حلول تمويلية مرنة تناسب جميع الميزانيات',
      shortDescEn: 'Flexible financing solutions to suit all budgets',
      descriptionAr: 'نوفر حلولاً تمويلية مرنة تتيح لك امتلاك نظام شمسي احترافي دون الحاجة لدفع المبلغ كاملاً مقدماً.',
      descriptionEn: 'We offer flexible financing solutions that allow you to own a professional solar system without paying the full amount upfront.',
      icon: 'CreditCard',
      features: [
        { ar: 'دفعة أولى منخفضة', en: 'Low down payment' },
        { ar: 'أقساط شهرية ميسرة', en: 'Affordable monthly installments' },
        { ar: 'تمويل حتى 5 سنوات', en: 'Financing up to 5 years' },
      ],
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug_userId: { slug: service.slug, userId } },
      update: {},
      create: { ...service, userId },
    });
  }
  console.log('✅ Services created');

  // 5. Projects
  const systemRecord = await prisma.solarSystem.findUnique({ 
    where: { slug_userId: { slug: 'on-grid-system', userId } } 
  });

  const projects = [
    {
      slug: 'villa-ramallah',
      titleAr: 'فيلا سكنية - رام الله',
      titleEn: 'Residential Villa - Ramallah',
      descriptionAr: 'تركيب نظام شمسي متصل بالشبكة بقدرة 10 كيلوواط لفيلا سكنية فاخرة في رام الله. وفّر المشروع 85% من الفاتورة الكهربائية الشهرية.',
      descriptionEn: 'Installation of a 10kW on-grid solar system for a luxury residential villa in Ramallah. The project saved 85% of the monthly electricity bill.',
      category: 'RESIDENTIAL' as const,
      location: 'رام الله',
      powerKw: 10,
      panelsCount: 18,
      completionDate: new Date('2024-06-15'),
      clientName: 'عائلة أبو عمر',
      annualSavingIls: 8500,
      coverImage: '/images/projects/villa-ramallah.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: true,
      systemId: systemRecord?.id,
    },
    {
      slug: 'supermarket-nablus',
      titleAr: 'سوبرماركت - نابلس',
      titleEn: 'Supermarket - Nablus',
      descriptionAr: 'مشروع تجاري ضخم بقدرة 50 كيلوواط لسوبرماركت في نابلس. قلّل المشروع فاتورة الكهرباء بنسبة 70%.',
      descriptionEn: 'Large commercial project of 50kW for a supermarket in Nablus. The project reduced the electricity bill by 70%.',
      category: 'COMMERCIAL' as const,
      location: 'نابلس',
      powerKw: 50,
      panelsCount: 91,
      completionDate: new Date('2024-03-20'),
      clientName: null,
      annualSavingIls: 42000,
      coverImage: '/images/projects/supermarket-nablus.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: true,
      systemId: systemRecord?.id,
    },
    {
      slug: 'farm-jericho',
      titleAr: 'مزرعة زراعية - أريحا',
      titleEn: 'Agricultural Farm - Jericho',
      descriptionAr: 'نظام شمسي منفصل عن الشبكة لمزرعة في أريحا. يوفر الطاقة لمضخات المياه وأنظمة الري.',
      descriptionEn: 'Off-grid solar system for a farm in Jericho. Provides power for water pumps and irrigation systems.',
      category: 'AGRICULTURAL' as const,
      location: 'أريحا',
      powerKw: 30,
      panelsCount: 55,
      completionDate: new Date('2023-12-10'),
      clientName: null,
      annualSavingIls: 25000,
      coverImage: '/images/projects/farm-jericho.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: true,
      systemId: null,
    },
    {
      slug: 'factory-hebron',
      titleAr: 'مصنع صناعي - الخليل',
      titleEn: 'Industrial Factory - Hebron',
      descriptionAr: 'مشروع صناعي بقدرة 200 كيلوواط لمصنع في الخليل. أحد أكبر مشاريعنا الصناعية.',
      descriptionEn: 'Industrial project of 200kW for a factory in Hebron. One of our largest industrial projects.',
      category: 'INDUSTRIAL' as const,
      location: 'الخليل',
      powerKw: 200,
      panelsCount: 364,
      completionDate: new Date('2024-01-05'),
      clientName: null,
      annualSavingIls: 168000,
      coverImage: '/images/projects/factory-hebron.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: false,
      systemId: systemRecord?.id,
    },
    {
      slug: 'school-jenin',
      titleAr: 'مدرسة حكومية - جنين',
      titleEn: 'Government School - Jenin',
      descriptionAr: 'نظام شمسي لمدرسة حكومية في جنين لتوفير تكاليف الطاقة وتعليم الطلاب عن الطاقة النظيفة.',
      descriptionEn: 'Solar system for a government school in Jenin to save energy costs and educate students about clean energy.',
      category: 'COMMERCIAL' as const,
      location: 'جنين',
      powerKw: 25,
      panelsCount: 46,
      completionDate: new Date('2023-09-01'),
      clientName: 'وزارة التربية والتعليم',
      annualSavingIls: 21000,
      coverImage: '/images/projects/school-jenin.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: false,
      systemId: systemRecord?.id,
    },
    {
      slug: 'house-bethlehem',
      titleAr: 'منزل عائلي - بيت لحم',
      titleEn: 'Family Home - Bethlehem',
      descriptionAr: 'نظام هجين لمنزل عائلي في بيت لحم يجمع بين الاتصال بالشبكة والبطاريات الاحتياطية.',
      descriptionEn: 'Hybrid system for a family home in Bethlehem combining grid connection with backup batteries.',
      category: 'RESIDENTIAL' as const,
      location: 'بيت لحم',
      powerKw: 8,
      panelsCount: 15,
      completionDate: new Date('2024-08-20'),
      clientName: null,
      annualSavingIls: 6800,
      coverImage: '/images/projects/house-bethlehem.jpg',
      gallery: {
        create: []
      },
      isActive: true,
      isFeatured: false,
      systemId: null,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug_userId: { slug: project.slug, userId } },
      update: {},
      create: { ...project, userId },
    });
  }
  console.log('✅ Projects created');

  // 6. Testimonials
  const testimonials = [
    {
      nameAr: 'محمد أبو خضر',
      nameEn: 'Mohammad Abu Khader',
      titleAr: 'صاحب منزل - رام الله',
      titleEn: 'Homeowner - Ramallah',
      contentAr: 'تجربة رائعة مع سولار برو. ركّبوا النظام في يومين فقط والفاتورة انخفضت من 800 شيكل لأقل من 100 شيكل شهرياً. مش مصدق!',
      contentEn: 'Amazing experience with SolarPro. They installed the system in just two days and the bill dropped from 800 NIS to less than 100 NIS monthly. Unbelievable!',
      rating: 5,
      location: 'رام الله',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      nameAr: 'ليلى عبد الرحمن',
      nameEn: 'Layla Abdul Rahman',
      titleAr: 'صاحبة مشغل خياطة - نابلس',
      titleEn: 'Sewing Workshop Owner - Nablus',
      contentAr: 'النظام الشمسي غيّر حياتنا في الشغل. ما عدنا نخاف من انقطاع الكهرباء أو الفواتير الباهظة. الفريق محترف جداً.',
      contentEn: 'The solar system changed our work life. We no longer fear power outages or high bills. The team is very professional.',
      rating: 5,
      location: 'نابلس',
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      nameAr: 'خالد المصري',
      nameEn: 'Khaled Al-Masri',
      titleAr: 'مزارع - أريحا',
      titleEn: 'Farmer - Jericho',
      contentAr: 'الحل الأمثل لمزرعتي. ضخ المياه أصبح مجانياً تقريباً وأنا الآن أوفر آلاف الشواكل كل شهر على الديزل.',
      contentEn: 'The perfect solution for my farm. Water pumping is now almost free and I save thousands of shekels every month on diesel.',
      rating: 5,
      location: 'أريحا',
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
    },
    {
      nameAr: 'سمر يوسف',
      nameEn: 'Samar Yousef',
      titleAr: 'مديرة مدرسة - جنين',
      titleEn: 'School Principal - Jenin',
      contentAr: 'المشروع كان استثماراً رائعاً للمدرسة. لم نوفر فقط في الفواتير بل أيضاً علّمنا الطلاب أهمية الطاقة المتجددة.',
      contentEn: 'The project was a great investment for the school. We not only saved on bills but also taught students the importance of renewable energy.',
      rating: 4,
      location: 'جنين',
      isActive: true,
      isFeatured: false,
      sortOrder: 4,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: { ...testimonial, userId } }).catch(() => { });
  }
  console.log('✅ Testimonials created');

  // 7. Site Settings
  const settings = [
    { key: 'site_name_ar', value: 'سولار برو', type: 'text', group: 'general' },
    { key: 'site_name_en', value: 'SolarPro', type: 'text', group: 'general' },
    { key: 'site_description_ar', value: 'خبراء في تركيب أنظمة الطاقة الشمسية في فلسطين', type: 'text', group: 'general' },
    { key: 'site_description_en', value: 'Solar Energy System Installation Experts in Palestine', type: 'text', group: 'general' },
    { key: 'phone', value: '+970591234567', type: 'text', group: 'contact' },
    { key: 'whatsapp', value: '970591234567', type: 'text', group: 'contact' },
    { key: 'email', value: 'info@solarpro.ps', type: 'text', group: 'contact' },
    { key: 'address_ar', value: 'رام الله، فلسطين', type: 'text', group: 'contact' },
    { key: 'address_en', value: 'Ramallah, Palestine', type: 'text', group: 'contact' },
    { key: 'working_hours_ar', value: 'الأحد - الخميس: 8:00 - 17:00', type: 'text', group: 'contact' },
    { key: 'working_hours_en', value: 'Sun - Thu: 8:00 AM - 5:00 PM', type: 'text', group: 'contact' },
    { key: 'facebook', value: 'https://facebook.com/solarpro.ps', type: 'text', group: 'social' },
    { key: 'instagram', value: 'https://instagram.com/solarpro.ps', type: 'text', group: 'social' },
    { key: 'youtube', value: 'https://youtube.com/@solarpro', type: 'text', group: 'social' },
    { key: 'hero_title_ar', value: 'طاقة شمسية لمستقبل أفضل', type: 'text', group: 'homepage' },
    { key: 'hero_title_en', value: 'Solar Energy for a Better Future', type: 'text', group: 'homepage' },
    { key: 'hero_subtitle_ar', value: 'نصمم ونركب أنظمة الطاقة الشمسية المتكاملة لمنزلك وعملك بأعلى جودة وأفضل أسعار', type: 'text', group: 'homepage' },
    { key: 'hero_subtitle_en', value: 'We design and install comprehensive solar energy systems for your home and business with the highest quality and best prices', type: 'text', group: 'homepage' },
    { key: 'stats_years', value: '10', type: 'number', group: 'homepage' },
    { key: 'stats_projects', value: '500', type: 'number', group: 'homepage' },
    { key: 'stats_kw', value: '5000', type: 'number', group: 'homepage' },
    { key: 'stats_clients', value: '450', type: 'number', group: 'homepage' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key_userId: { key: setting.key, userId } },
      update: { value: setting.value },
      create: { ...setting, userId },
    });
  }
  console.log('✅ Settings created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
