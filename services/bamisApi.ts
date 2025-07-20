interface RegionAdvice {
  region: string;
  districts: string[];
  crops: {
    [cropName: string]: {
      stage: string;
      advice: string[];
      warnings?: string[];
    };
  };
  livestock: string[];
  poultry: string[];
  fisheries: string[];
}

interface WeatherBulletin {
  date: string;
  period: string;
  regions: RegionAdvice[];
  satelliteData: {
    ndvi: string;
    vci: string;
    tci: string;
    vhi: string;
  };
}

interface NotificationItem {
  id: string;
  type: 'weather' | 'crop' | 'livestock' | 'urgent';
  title: string;
  message: string;
  region?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
}

// Mock real-time BAMIS data based on scraped content
export const getCurrentWeatherBulletin = async (): Promise<WeatherBulletin> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    date: "১৬ জুলাই ২০২৫",
    period: "১৬.০৭.২০২৫ - ২০.০৭.২০২৫",
    regions: [
      {
        region: "খুলনা অঞ্চল",
        districts: ["বাগেরহাট", "খুলনা", "নড়াইল", "সাতক্ষীরা"],
        crops: {
          "ধান আউশ": {
            stage: "দানা জমাট বাঁধা",
            advice: ["সেচ প্রয়োগ থেকে বিরত থাকুন।"]
          },
          "সবজি": {
            stage: "বৃদ্ধি",
            advice: [
              "দমকা হাওয়া থেকে গাছের ক্ষতি এড়াতে প্রয়োজনীয় ব্যবস্থা গ্রহণ করুন।",
              "বর্ষার এই মৌসুম নতুন বাগান করার জন্য অত্যন্ত উপযুক্ত সময়।"
            ],
            warnings: [
              "কুমড়া, ঝিঙে, পটল এবং শসায় লাল-কুমড়া বিটলের আক্রমণের সম্ভাবনা আছে।"
            ]
          }
        },
        livestock: [
          "বিভিন্ন রোগ থেকে রক্ষার জন্য পশু চিকিৎসকের পরামর্শ অনুযায়ী টিকা প্রদান করুন।",
          "গবাদি পশু উঁচু ও পরিষ্কার জায়গায় রাখুন।"
        ],
        poultry: [
          "হাঁসমুরগীকে কৃমিনাশক প্রদান করুন।",
          "হাঁসমুরগীর থাকার জায়গা পরিষ্কার ও জীবাণুমুক্ত রাখুন।"
        ],
        fisheries: [
          "মাছের আংশিক আহরণ করুন এবং আহরণের ৩/৪ দিন পর আহরিত মাছের ১০% বেশি পুনরায় মজুদ করুন।",
          "প্রতিদিন নির্দিষ্ট সময়ে ও নির্দিষ্ট স্থানে পরিমাণমত ভালো মানের খাবার প্রয়োগ করুন।"
        ]
      },
      {
        region: "ঢাকা অঞ্চল",
        districts: ["ঢাকা", "গাজীপুর", "কিশোরগঞ্জ", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "নারায়ণগঞ্জ", "নরসিংদী", "টাঙ্গাইল"],
        crops: {
          "ধান আমন": {
            stage: "চারা রোপণ",
            advice: [
              "বীজতলা থেকে ২৫-৩০ দিনের চারা মূল জমিতে রোপণের প্রস্তুতি নিন।",
              "জমির পানির স্তর ৫-৭ সেমি বজায় রাখুন।"
            ],
            warnings: ["গোড়া পচা রোগের আক্রমণ দেখা দিতে পারে।"]
          },
          "ভুট্টা": {
            stage: "মোচা গঠন",
            advice: [
              "অতিরিক্ত পানি নিষ্কাশন করুন।",
              "সেচ প্রয়োগ থেকে বিরত থাকুন।"
            ]
          }
        },
        livestock: [
          "পশুর থাকার জায়গার মেঝেতে যেন পানি জমে না থাকে সেদিকে লক্ষ্য রাখতে হবে।",
          "গবাদি পশুকে কাঁচা ঘাস ও দানাদার খাবার খেতে দিন।"
        ],
        poultry: [
          "শুকনো খাবার খেতে দিন এবং পরিষ্কার পানি পান করান।",
          "হাঁসমুরগীর থাকার জায়গায় পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা রাখুন।"
        ],
        fisheries: [
          "১৫ দিন পর পর নমুনায়ন করে মাছের বাড়ার হার ও রোগবালাই আছে কি না-পর্যবেক্ষণ করুন।",
          "মজুদ পরবর্তী সার নির্দিষ্ট হারে প্রয়োগ করুন।"
        ]
      }
    ],
    satelliteData: {
      ndvi: "NOAA/VIIRS BLENDED NDVI composite for week 28",
      vci: "NOAA/AVHRR BLENDED VCI composite for week 28", 
      tci: "NOAA/AVHRR BLENDED TCI composite for week 28",
      vhi: "NOAA/AVHRR BLENDED VHI composite for week 28"
    }
  };
};

export const generateNotifications = async (bulletin: WeatherBulletin): Promise<NotificationItem[]> => {
  const notifications: NotificationItem[] = [];
  const now = new Date();

  // Generate notifications based on bulletin data
  bulletin.regions.forEach((region, regionIndex) => {
    // Weather warnings
    Object.entries(region.crops).forEach(([cropName, cropData]) => {
      if (cropData.warnings && cropData.warnings.length > 0) {
        cropData.warnings.forEach((warning, warningIndex) => {
          notifications.push({
            id: `warning-${regionIndex}-${warningIndex}`,
            type: 'crop',
            title: `${cropName} সতর্কতা - ${region.region}`,
            message: warning,
            region: region.region,
            priority: 'high',
            timestamp: now,
            isRead: false
          });
        });
      }

      // Important advice
      if (cropData.advice.length > 0) {
        notifications.push({
          id: `advice-${regionIndex}-${cropName}`,
          type: 'crop',
          title: `${cropName} পরামর্শ - ${region.region}`,
          message: cropData.advice[0], // Take first advice
          region: region.region,
          priority: 'medium',
          timestamp: now,
          isRead: false
        });
      }
    });

    // Livestock notifications
    if (region.livestock.length > 0) {
      notifications.push({
        id: `livestock-${regionIndex}`,
        type: 'livestock',
        title: `গবাদি পশু পরিচর্যা - ${region.region}`,
        message: region.livestock[0],
        region: region.region,
        priority: 'medium',
        timestamp: now,
        isRead: false
      });
    }

    // Weather advisory
    notifications.push({
      id: `weather-${regionIndex}`,
      type: 'weather',
      title: `আবহাওয়া পরামর্শ - ${region.region}`,
      message: `${bulletin.period} সময়কালের জন্য কৃষি আবহাওয়া পরামর্শ প্রকাশিত হয়েছে।`,
      region: region.region,
      priority: 'low',
      timestamp: now,
      isRead: false
    });
  });

  // Add urgent notification for monsoon season
  notifications.unshift({
    id: 'urgent-monsoon',
    type: 'urgent',
    title: 'বর্ষা মৌসুমের জরুরি সতর্কতা',
    message: 'প্রবল বাতাস ও বৃষ্টির কারণে ফসল ও পশুপাখির বিশেষ যত্ন নিন। জরুরি প্রয়োজনে স্থানীয় কৃষি অফিসে যোগাযোগ করুন।',
    priority: 'high',
    timestamp: now,
    isRead: false
  });

  return notifications.slice(0, 10); // Return top 10 notifications
};

export const getRegionSpecificAdvice = async (userRegion: string): Promise<RegionAdvice | null> => {
  const bulletin = await getCurrentWeatherBulletin();
  return bulletin.regions.find(region => 
    region.region.includes(userRegion) || 
    region.districts.some(district => district.includes(userRegion))
  ) || null;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  // In a real app, this would update the backend
  console.log(`Marking notification ${notificationId} as read`);
};

export const getNotificationCount = async (): Promise<number> => {
  const bulletin = await getCurrentWeatherBulletin();
  const notifications = await generateNotifications(bulletin);
  return notifications.filter(n => !n.isRead).length;
};

export const getCurrentNotifications = async (): Promise<NotificationItem[]> => {
  const bulletin = await getCurrentWeatherBulletin();
  return await generateNotifications(bulletin);
};
