interface SeedPriceItem {
  id: number;
  title: string;
  publishDate: string;
  downloadUrl: string;
}

interface FertilizerPrice {
  name: string;
  dealerPrice: number;
  farmerPrice: number;
}

interface FormItem {
  id: number;
  title: string;
  url: string;
  category: string;
}

interface BADCService {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  url: string;
  category: 'seed' | 'fertilizer' | 'form' | 'general';
}

// Mock BADC data based on scraped content
export const getSeedPrices = async (): Promise<SeedPriceItem[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return [
    {
      id: 1,
      title: "২০২৪-২৫ বর্ষে উৎপাদিত বিভিন্ন জাত ও শ্রেণির বরো ধানবীজের ও ভুট্টোবীজের সংগ্রহমূল্য",
      publishDate: "২০২৫-০৬-১৯",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/31dc9911_95aa_478d_af3d_2580c60438eb/2025-06-22-09-40-2e0b47276f6de1e69fc9e4f0a404a5fa.pdf"
    },
    {
      id: 2,
      title: "২০২৪-২৫ উৎপাদন বর্ষে শীতকালীন ও গ্রীষ্মকালীন সবজি বীজের সংগ্রহমূল্য",
      publishDate: "২০২৫-০৫-২৭",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/c2d878bd_3c66_4afe_9f69_4014fc4b4ade/2025-05-28-07-19-5fae5b072b114c925896fe0b2e1dfad3.pdf"
    },
    {
      id: 3,
      title: "২০২৫-২০ বর্ষে সবজি বিভাগের মাধ্যমেউৎপাদিত সিমবীজ ও কলমিশাক বীজের বিক্রয়মূল্য নির্ধারণ",
      publishDate: "২০২৫-০৫-২৭",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/1528d947_68d5_49cd_8f3a_c3eb1565c6fd/2025-05-28-07-15-defe02af8d26b3ef0455b00be059fb6f.pdf"
    },
    {
      id: 4,
      title: "২০২৪-২৫ উৎপাদন বর্ষে বিভিন্ন জাত ও শ্রেণির গমবীজের সংগ্রহমূল্য",
      publishDate: "২০২৫-০৫-২৪",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/f7b6d217_9017_4d24_a567_d80c4c3f1467/2025-05-24-10-40-1f2064de90fb90af5438b3385cfa9458.pdf"
    },
    {
      id: 5,
      title: "২০২৪-২৫ বর্ষে পাটবীজের বিক্রয়মূল্য নিম্মোক্তভাবে পুন:নির্ধারণ করা হয়েছে",
      publishDate: "২০২৫-০৫-০৮",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/32693b13_6389_4473_9dcb_5388d3bc9542/2025-05-13-10-20-3bd1427451088ae7bee8bd72a56ad956.pdf"
    },
    {
      id: 6,
      title: "২০২৪-২৫ বর্ষে রবি মৌসুমে উৎপাদিত মসুর, খেসারি, ছোলা, মটর, ফেলন, সরিষা ও সূর্যমুখী বীজের সংগ্রহমূল্য",
      publishDate: "২০২৫-০৪-২৩",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/ea54ea58_b17d_4be7_b528_bdfc76d2e68c/2025-04-24-09-14-96b22a6d743b8355a81005b1e4a1ec54.pdf"
    },
    {
      id: 7,
      title: "২০২৪-২৫ উৎপাদন বর্ষে বিভিন্ন জাত ও শ্রেণির আমন ধানবীজের সংগ্রহমূল্য",
      publishDate: "২০২৫-০৪-২০",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/9122f014_f125_441d_9e18_a689a29a4701/2025-04-21-10-08-55d3f284405bff43e3ac2a446c40b0d3.pdf"
    },
    {
      id: 8,
      title: "২০২৪-২৫ উৎপাদন বর্ষে আলুবীজ ও প্লান্টলেট এর সংগ্রহ মুল্য নির্ধারণ",
      publishDate: "২০২৫-০৪-২০",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/2522d9fe_b902_408e_8890_a2e8a556a76d/2025-04-23-10-03-d47326fa1e50ebe3b68a5b36dd8ea8ab.pdf"
    },
    {
      id: 9,
      title: "২০২৪-২৫ অর্থবছরে হাইব্রিড সূর্যমুখী বীজের বিক্রয় মূল্য",
      publishDate: "২০২৪-১১-০৪",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/2ea873ae_0ceb_4938_9898_8270a3babb34/2024-11-04-10-31-250d5cf7e9131dd020c16fc960f3afbd.pdf"
    },
    {
      id: 10,
      title: "২০২৪-২৫ অর্থবছরে বীজ আলুর বিক্রয় মূল্য",
      publishDate: "২০২৪-০৯-০৯",
      downloadUrl: "https://badc.gov.bd/sites/default/files/files/badc.portal.gov.bd/miscellaneous_info/57e0c78c_5735_469d_8318_0662429c07fb/2024-09-18-05-40-4c28af3146643bd4a3fbdea09aacc33d.pdf"
    }
  ];
};

export const getFertilizerPrices = async (): Promise<FertilizerPrice[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      name: "টিএসপি",
      dealerPrice: 25,
      farmerPrice: 27
    },
    {
      name: "এমওপি",
      dealerPrice: 18,
      farmerPrice: 20
    },
    {
      name: "ডিএপি",
      dealerPrice: 19,
      farmerPrice: 21
    }
  ];
};

export const getBADCForms = async (): Promise<FormItem[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  return [
    {
      id: 1,
      title: "গোপনীয় অনুবেদন ফর্ম (এসিআর)",
      url: "https://badc.gov.bd/site/forms/1e05d35b-4074-4b56-8f06-c3aec4772ab1/",
      category: "কর্মকর্তা/কর্মচারী"
    },
    {
      id: 2,
      title: "বার্ষিক কর্মসম্পাদন চুক্তি(এপিএ) বাস্তবায়নে পুরস্কারের জন্য কর্মকর্তা/কর্মচারীদের মনোনয়ন ফরম",
      url: "https://badc.gov.bd/site/forms/71963a86-1f6f-4eea-8edc-f636df0a154a/",
      category: "কর্মকর্তা/কর্মচারী"
    },
    {
      id: 3,
      title: "প্রদেয় ভবিষ্য ঋণের আবেদন সংশোধন ফরম",
      url: "https://badc.gov.bd/site/forms/2c7b6c8e-3718-436d-8e0e-9d654510299b/",
      category: "আর্থিক"
    },
    {
      id: 4,
      title: "নির্মাণ বিভাগের ঠিকাদার তালিকাভূক্তি আবেদন ফরম",
      url: "https://badc.gov.bd/site/forms/006b3727-b1f3-431d-8fe2-741e0188e992/",
      category: "ঠিকাদার"
    },
    {
      id: 5,
      title: "নির্মাণ বিভাগের ঠিকাদারী নবায়ন ফরম",
      url: "https://badc.gov.bd/site/forms/a41316b1-2351-4333-b075-2de8ad808035/",
      category: "ঠিকাদার"
    },
    {
      id: 6,
      title: "মনিটরিং বিভাগের সেচযন্ত্রের স্টোর পরিদর্শন ছক",
      url: "https://badc.gov.bd/site/forms/7b5208f0-5c46-4043-8161-dbde81a7dd70/",
      category: "মনিটরিং"
    },
    {
      id: 7,
      title: "মনিটরিং বিভাগের বীজ/সার গুদাম পরিদর্শন ছক",
      url: "https://badc.gov.bd/site/forms/8acd0936-bc3f-4096-8dba-d5cc0f7f36ed/",
      category: "মনিটরিং"
    },
    {
      id: 8,
      title: "বীজ ডিলার নিবন্ধন/নবায়্ন ফরম",
      url: "https://badc.gov.bd/site/forms/34504bcc-3a6f-41c2-a4a9-ae9eb0573249/",
      category: "ডিলার"
    },
    {
      id: 9,
      title: "বিএডিসি'র চাকুরীর জন্য আবেদন ফরম",
      url: "https://badc.gov.bd/site/forms/51a6d516-3cf7-46e2-862b-5f239104ec56/",
      category: "চাকরি"
    },
    {
      id: 10,
      title: "প্রদেয় ভবিষ্যৎ তহবিল খোলার আবেদন ফরম",
      url: "https://badc.gov.bd/site/forms/26b1ab46-70f1-470d-b291-adf1dca45881/",
      category: "আর্থিক"
    },
    {
      id: 11,
      title: "কর্মচারী কল্যাণ ও অনুদান তহবিল হতে সাহায্যের আবেদন ফরম",
      url: "https://badc.gov.bd/site/forms/586e6f64-31ea-401a-bcbd-aa383ef58cef/",
      category: "কর্মচারী কল্যাণ"
    },
    {
      id: 12,
      title: "বিএডিসিতে বিভিন্ন পদে যোগদান সংক্রান্ত ফরম",
      url: "https://badc.gov.bd/site/forms/20f6360d-1b09-4607-9050-8d1d5e146f34/",
      category: "চাকরি"
    }
  ];
};

export const getBADCServices = async (): Promise<BADCService[]> => {
  return [
    {
      id: "seed-prices",
      title: "Seed Price List",
      titleBn: "বীজের মূল্য তালিকা",
      description: "Access current seed prices for various crops including rice, wheat, vegetables, and other agricultural seeds.",
      url: "https://badc.gov.bd/site/view/miscellaneous_info/বীজের-মূল্য-তালিকা/-",
      category: "seed"
    },
    {
      id: "fertilizer-prices",
      title: "Fertilizer Prices",
      titleBn: "সারের বিক্রয়মূল্য",
      description: "Current fertilizer prices for TSP, MOP, and DAP at dealer and farmer levels.",
      url: "https://badc.gov.bd/site/page/264203a4-babc-46fb-a56a-b36df05e6729/-",
      category: "fertilizer"
    },
    {
      id: "forms",
      title: "Application Forms",
      titleBn: "আবেদন ফরম",
      description: "Download various application forms for BADC services including dealer registration, employment, and other services.",
      url: "https://badc.gov.bd/site/view/forms/-",
      category: "form"
    },
    {
      id: "erp",
      title: "BADC ERP Software",
      titleBn: "বিএডিসি ইআরপি সফটওয়্যার",
      description: "Access BADC Enterprise Resource Planning software for internal operations.",
      url: "http://badcerp.gov.bd/",
      category: "general"
    },
    {
      id: "seed-dealer",
      title: "Seed Dealer Registration",
      titleBn: "বীজ ডিলার নিয়োগ আবেদন",
      description: "Apply for seed dealer registration and licensing.",
      url: "http://service.moa.gov.bd/license/seed-dealer-circular",
      category: "general"
    },
    {
      id: "fertilizer-dealer",
      title: "Fertilizer Dealer License Renewal",
      titleBn: "সার ডিলার লাইসেন্স নবায়ন",
      description: "Renew fertilizer dealer licenses online.",
      url: "http://service.moa.gov.bd/portal/service-details?service_type=orgList&org_id=3&service_id=75",
      category: "general"
    }
  ];
};

export const searchSeedPrices = async (query: string): Promise<SeedPriceItem[]> => {
  const allPrices = await getSeedPrices();
  return allPrices.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  );
};

export const searchForms = async (query: string): Promise<FormItem[]> => {
  const allForms = await getBADCForms();
  return allForms.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.includes(query)
  );
};

export const getFormsByCategory = async (category: string): Promise<FormItem[]> => {
  const allForms = await getBADCForms();
  return allForms.filter(item => item.category === category);
};
