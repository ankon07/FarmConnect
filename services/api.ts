// Mock API service for FarmConnect app

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// User Authentication
export const loginUser = async (username: string, password: string) => {
  await wait(1000);
  
  // Mock successful login
  if (username && password) {
    return {
      success: true,
      data: {
        id: "user123",
        name: "Rahim Ahmed",
        username: username,
        imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        location: "Gazipur, Bangladesh",
      },
    };
  }
  
  return {
    success: false,
    message: "Invalid username or password",
  };
};

export const registerUser = async (name: string, username: string, password: string) => {
  await wait(1000);
  
  // Mock successful registration
  if (name && username && password) {
    return {
      success: true,
      data: {
        id: "user123",
        name: name,
        username: username,
        imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        location: "Gazipur, Bangladesh",
      },
    };
  }
  
  return {
    success: false,
    message: "Registration failed. Please try again.",
  };
};

// Dashboard Data
export const fetchWeatherData = async (location: any) => {
  await wait(500);
  
  return {
    success: true,
    data: {
      temperature: 28,
      condition: "Partly Cloudy",
      humidity: 65,
      soilMoisture: "Medium",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
    },
  };
};

export const fetchQuickTips = async () => {
  await wait(500);
  
  return {
    success: true,
    data: [
      {
        id: "tip1",
        title: "Pest Alert",
        description: "Watch for aphids on your tomato plants this week due to increased humidity.",
      },
      {
        id: "tip2",
        title: "Fertilizer Tip",
        description: "Apply nitrogen-rich fertilizer to rice fields before the upcoming rain.",
      },
      {
        id: "tip3",
        title: "Market Insight",
        description: "Potato prices expected to rise next week. Consider delaying your harvest if possible.",
      },
    ],
  };
};

// Disease Diagnosis
export const analyzeDiseaseImage = async (imageUri: string, category: string) => {
  await wait(2000);
  
  // Mock diagnosis results based on category
  if (category === "crop") {
    return {
      success: true,
      data: {
        diseaseName: "Late Blight",
        description: "Late blight is a plant disease that mainly affects potatoes and tomatoes, causing significant damage to leaves, stems, and fruits. It's caused by the fungus-like organism Phytophthora infestans.",
        treatment: "Apply copper-based fungicide immediately. Remove and destroy infected plants to prevent spread. Ensure proper spacing between plants for better air circulation.",
        severity: "High",
      },
    };
  } else if (category === "livestock") {
    return {
      success: true,
      data: {
        diseaseName: "Foot and Mouth Disease",
        description: "Foot and mouth disease is a highly contagious viral disease affecting cattle, sheep, and pigs. It causes fever and blisters on the mouth and feet.",
        treatment: "Isolate infected animals immediately. Contact your local veterinarian for proper treatment. Maintain strict biosecurity measures to prevent spread.",
        severity: "High",
      },
    };
  } else {
    return {
      success: true,
      data: {
        diseaseName: "White Spot Disease",
        description: "White spot disease is a viral infection that affects fish, causing white spots on the skin and gills. It can lead to high mortality rates in fish farms.",
        treatment: "Increase water temperature to 30°C for 3-4 days if possible. Add aquarium salt at a rate of 1-3 g/L. Improve water quality through regular changes.",
        severity: "Medium",
      },
    };
  }
};

// Market Prices
export const fetchMarketPrices = async (filters: any) => {
  await wait(800);
  
  const cropPrices = [
    { id: "p1", itemName: "Rice (চাল)", price: "65 /kg", unit: "1 kg", marketName: "Dhaka Wholesale Market", distance: "5.2" },
    { id: "p2", itemName: "Potato (আলু)", price: "25 /kg", unit: "1 kg", marketName: "Gazipur Bazar", distance: "2.1" },
    { id: "p3", itemName: "Tomato (টমেটো)", price: "40 /kg", unit: "1 kg", marketName: "Savar Market", distance: "8.7" },
    { id: "p4", itemName: "Onion (পেঁয়াজ)", price: "55 /kg", unit: "1 kg", marketName: "Dhaka Retail Market", distance: "5.5" },
    { id: "p5", itemName: "Garlic (রসুন)", price: "120 /kg", unit: "1 kg", marketName: "Karwan Bazar", distance: "6.3" },
  ];
  
  const livestockPrices = [
    { id: "l1", itemName: "Chicken (মুরগি)", price: "180 /kg", unit: "1 kg", marketName: "Dhaka Poultry Market", distance: "5.8" },
    { id: "l2", itemName: "Beef (গরুর মাংস)", price: "650 /kg", unit: "1 kg", marketName: "Gazipur Meat Market", distance: "2.3" },
    { id: "l3", itemName: "Goat (ছাগল)", price: "750 /kg", unit: "1 kg", marketName: "Savar Livestock Market", distance: "8.9" },
    { id: "l4", itemName: "Eggs (ডিম)", price: "120 /dozen", unit: "12 pcs", marketName: "Dhaka Retail Market", distance: "5.5" },
  ];
  
  const fishPrices = [
    { id: "f1", itemName: "Hilsa (ইলিশ)", price: "850 /kg", unit: "1 kg", marketName: "Dhaka Fish Market", distance: "5.4" },
    { id: "f2", itemName: "Rui (রুই)", price: "250 /kg", unit: "1 kg", marketName: "Gazipur Fish Market", distance: "2.2" },
    { id: "f3", itemName: "Catfish (মাগুর)", price: "350 /kg", unit: "1 kg", marketName: "Savar Fish Market", distance: "8.8" },
    { id: "f4", itemName: "Tilapia (তেলাপিয়া)", price: "180 /kg", unit: "1 kg", marketName: "Local Pond Market", distance: "3.1" },
  ];
  
  // Return data based on category filter
  if (filters.category === "crop") {
    return { success: true, data: cropPrices };
  } else if (filters.category === "livestock") {
    return { success: true, data: livestockPrices };
  } else if (filters.category === "fish") {
    return { success: true, data: fishPrices };
  }
  
  // Default to crop prices
  return { success: true, data: cropPrices };
};

// Contacts
export const findNearbyVets = async (params: any) => {
  await wait(800);
  
  const vets = [
    { id: "v1", name: "Dr. Karim Uddin", title: "Veterinary Surgeon", location: "Gazipur", imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01712345678" },
    { id: "v2", name: "Dr. Farida Akhter", title: "Poultry Specialist", location: "Mymensingh", imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01812345678" },
    { id: "v3", name: "Dr. Rahim Khan", title: "Livestock Veterinarian", location: "Savar", imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01912345678" },
  ];
  
  const agricultureOfficers = [
    { id: "a1", name: "Md. Shahidul Islam", title: "Agriculture Officer", location: "Tangail", imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01612345678" },
    { id: "a2", name: "Nasreen Jahan", title: "Crop Specialist", location: "Dhaka", imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01512345678" },
    { id: "a3", name: "Abdul Karim", title: "Fisheries Officer", location: "Gazipur", imageUrl: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01312345678" },
  ];

  const equipmentSuppliers = [
    { id: "e1", name: "Farm Machinery Ltd.", title: "Tractor & Harvester Supplier", location: "Dhaka", imageUrl: "https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01412345678" },
    { id: "e2", name: "Irrigation Solutions Co.", title: "Water Pump & Irrigation Systems", location: "Comilla", imageUrl: "https://images.unsplash.com/photo-1617781377265-7248991e257f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", phone: "01998765432" },
  ];
  
  // Filter based on type
  if (params.filter === "veterinarians") {
    return { success: true, data: vets };
  } else if (params.filter === "agriculture officers") {
    return { success: true, data: agricultureOfficers };
  } else if (params.filter === "equipment suppliers") {
    return { success: true, data: equipmentSuppliers };
  }
  
  // Return all contacts by default
  return { success: true, data: [...vets, ...agricultureOfficers, ...equipmentSuppliers] };
};

// Fertilizer Stock
export const getFertilizerStock = async (params: any) => {
  await wait(800);
  
  return {
    success: true,
    data: [
      {
        id: "store1",
        name: "Government Fertilizer Store - Gazipur",
        address: "Main Road, Gazipur Sadar, Gazipur",
        distance: "2.3",
        inStock: true,
        products: [
          { id: "f1", name: "Urea", available: true, quantity: 500, unit: "bags" },
          { id: "f2", name: "TSP", available: true, quantity: 300, unit: "bags" },
          { id: "f3", name: "MoP", available: false, quantity: 0, unit: "bags" },
        ],
      },
      {
        id: "store2",
        name: "BADC Fertilizer Center",
        address: "Agricultural Complex, Joydebpur, Gazipur",
        distance: "4.1",
        inStock: true,
        products: [
          { id: "f1", name: "Urea", available: true, quantity: 200, unit: "bags" },
          { id: "f2", name: "TSP", available: false, quantity: 0, unit: "bags" },
          { id: "f3", name: "MoP", available: true, quantity: 150, unit: "bags" },
        ],
      },
      {
        id: "store3",
        name: "District Agricultural Office Store",
        address: "District HQ, Gazipur",
        distance: "5.7",
        inStock: false,
        products: [
          { id: "f1", name: "Urea", available: false, quantity: 0, unit: "bags" },
          { id: "f2", name: "TSP", available: false, quantity: 0, unit: "bags" },
          { id: "f3", name: "MoP", available: false, quantity: 0, unit: "bags" },
        ],
      },
    ],
  };
};

// Equipment Rental
export const getEquipmentList = async (params: any) => {
  await wait(800);
  
  return {
    success: true,
    data: [
      {
        id: "e1",
        name: "Tractor - Medium Size",
        available: true,
        distance: "3.2",
        imageUrl: "https://images.unsplash.com/photo-1605002123888-c56cdd0ba9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        price: "1500 /day",
      },
      {
        id: "e2",
        name: "Rice Harvester",
        available: true,
        distance: "5.7",
        imageUrl: "https://images.unsplash.com/photo-1591086429666-004a1e6e620b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        price: "2500 /day",
      },
      {
        id: "e3",
        name: "Water Pump - Diesel",
        available: true,
        distance: "2.1",
        imageUrl: "https://images.unsplash.com/photo-1617781377265-7248991e257f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        price: "500 /day",
      },
      {
        id: "e4",
        name: "Rotavator",
        available: false,
        distance: "4.3",
        imageUrl: "https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        price: "1200 /day",
      },
    ],
  };
};

// Repair Services
export const getRepairStatus = async (params: any) => {
  await wait(800);
  
  if (params.type === "services") {
    return {
      success: true,
      data: [
        {
          id: "r1",
          name: "Mobile Repair Service",
          available: true,
          distance: "2.5",
          imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          price: "Service charge starts at 500 Tk",
        },
        {
          id: "r2",
          name: "Agricultural Mechanics",
          available: true,
          distance: "4.8",
          imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          price: "Service charge starts at 800 Tk",
        },
        {
          id: "r3",
          name: "Irrigation System Repair",
          available: false,
          distance: "6.2",
          imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          price: "Service charge starts at 1000 Tk",
        },
      ],
    };
  } else if (params.type === "bookings") {
    return {
      success: true,
      data: [
        {
          id: "b1",
          serviceName: "Mobile Repair Service",
          status: "Completed",
          bookingDate: "2023-05-15",
          scheduledDate: "2023-05-16",
          equipmentName: "Tractor Engine Repair",
          notes: "Engine not starting properly",
        },
        {
          id: "b2",
          serviceName: "Agricultural Mechanics",
          status: "In Progress",
          bookingDate: "2023-05-20",
          scheduledDate: "2023-05-21",
          equipmentName: "Water Pump Repair",
          notes: "Leaking from the main valve",
        },
        {
          id: "b3",
          serviceName: "Mobile Repair Service",
          status: "Requested",
          bookingDate: "2023-05-25",
          scheduledDate: null,
          equipmentName: "Harvester Blade Replacement",
          notes: "Blades are dull and need replacement",
        },
      ],
    };
  }
  
  return {
    success: false,
    message: "Invalid request type",
  };
};

export const requestRepair = async (serviceId: string) => {
  await wait(1000);
  
  return {
    success: true,
    data: {
      id: "b4",
      serviceName: "Mobile Repair Service",
      status: "Requested",
      bookingDate: new Date().toISOString().split("T")[0],
      scheduledDate: null,
      equipmentName: "Generic Equipment Repair",
      notes: "New repair request",
    },
  };
};

// Contracts
export const fetchContracts = async () => {
  await wait(800);

  return {
    success: true,
    data: [
      {
        id: "c1",
        title: "Rice Cultivation Agreement",
        type: "Crop",
        status: "Active",
        startDate: "2023-03-01",
        endDate: "2023-08-31",
        party: "ABC Millers",
        value: "500,000 BDT",
        details: "Agreement for the supply of 10 tons of rice.",
      },
      {
        id: "c2",
        title: "Poultry Supply Contract",
        type: "Livestock",
        status: "Pending",
        startDate: "2023-06-01",
        endDate: "2024-05-31",
        party: "XYZ Poultry Farm",
        value: "1,200,000 BDT",
        details: "Contract for regular supply of broiler chickens.",
      },
      {
        id: "c3",
        title: "Land Lease Agreement",
        type: "Land",
        status: "Active",
        startDate: "2022-01-01",
        endDate: "2026-12-31",
        party: "Government Agriculture Dept.",
        value: "10,000 BDT/year",
        details: "Lease agreement for 5 acres of agricultural land.",
      },
      {
        id: "c4",
        title: "Fish Farming Partnership",
        type: "Fisheries",
        status: "Completed",
        startDate: "2022-09-01",
        endDate: "2023-02-28",
        party: "Local Fishermen Co-op",
        value: "300,000 BDT",
        details: "Partnership for Tilapia fish farming.",
      },
    ],
  };
};

// Weather Forecast
export const fetchWeatherForecast = async (params: { latitude: number; longitude: number }) => {
  try {
    const { latitude, longitude } = params;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason);
    }

    const weatherCodeMap: { [key: number]: { condition: string; iconUrl: string } } = {
      0: { condition: "Clear sky", iconUrl: "https://cdn-icons-png.flaticon.com/512/979/979585.png" },
      1: { condition: "Mainly clear", iconUrl: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png" },
      2: { condition: "Partly cloudy", iconUrl: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png" },
      3: { condition: "Overcast", iconUrl: "https://cdn-icons-png.flaticon.com/512/414/414927.png" },
      45: { condition: "Fog", iconUrl: "https://cdn-icons-png.flaticon.com/512/1759/1759220.png" },
      48: { condition: "Depositing rime fog", iconUrl: "https://cdn-icons-png.flaticon.com/512/1759/1759220.png" },
      51: { condition: "Drizzle light", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      53: { condition: "Drizzle moderate", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      55: { condition: "Drizzle dense", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      56: { condition: "Freezing Drizzle light", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      57: { condition: "Freezing Drizzle dense", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      61: { condition: "Rain slight", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      63: { condition: "Rain moderate", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      65: { condition: "Rain heavy", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      66: { condition: "Freezing Rain light", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      67: { condition: "Freezing Rain heavy", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      71: { condition: "Snow fall slight", iconUrl: "https://cdn-icons-png.flaticon.com/512/1779/1779883.png" },
      73: { condition: "Snow fall moderate", iconUrl: "https://cdn-icons-png.flaticon.com/512/1779/1779883.png" },
      75: { condition: "Snow fall heavy", iconUrl: "https://cdn-icons-png.flaticon.com/512/1779/1779883.png" },
      77: { condition: "Snow grains", iconUrl: "https://cdn-icons-png.flaticon.com/512/1779/1779883.png" },
      80: { condition: "Rain showers slight", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      81: { condition: "Rain showers moderate", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      82: { condition: "Rain showers violent", iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png" },
      85: { condition: "Snow showers slight", iconUrl: "https://cdn-icons-png.flaticon.com/512/1779/1779883.png" },
      86: { condition: "Snow showers heavy", iconUrl: "https://cdn-icons-png.flaticon.com/512/1779/1779883.png" },
      95: { condition: "Thunderstorm", iconUrl: "https://cdn-icons-png.flaticon.com/512/1959/1959338.png" },
      96: { condition: "Thunderstorm with slight hail", iconUrl: "https://cdn-icons-png.flaticon.com/512/1959/1959338.png" },
      99: { condition: "Thunderstorm with heavy hail", iconUrl: "https://cdn-icons-png.flaticon.com/512/1959/1959338.png" },
    };

    const getCurrentWeatherCondition = (code: number) => {
      return weatherCodeMap[code] || { condition: "Unknown", iconUrl: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png" };
    };

    const currentCondition = getCurrentWeatherCondition(data.current.weather_code);

    const forecastData = data.daily.time.map((time: string, index: number) => {
      const dailyCode = data.daily.weather_code[index];
      const dailyCondition = getCurrentWeatherCondition(dailyCode);
      return {
        date: time,
        maxTemp: data.daily.temperature_2m_max[index],
        minTemp: data.daily.temperature_2m_min[index],
        condition: dailyCondition.condition,
        iconUrl: dailyCondition.iconUrl,
      };
    });

    return {
      success: true,
      data: {
        current: {
          date: data.current.time,
          temperature: data.current.temperature_2m,
          feelsLike: data.current.temperature_2m, // Open-Meteo doesn't provide feelsLike directly, using temperature_2m
          condition: currentCondition.condition,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          uvIndex: 0, // Open-Meteo doesn't provide UV index directly
          iconUrl: currentCondition.iconUrl,
        },
        forecast: forecastData,
        farmingTips: [
          {
            title: "Irrigation Recommendation",
            description: "Based on the forecast, moderate irrigation is recommended for the next 3 days. Reduce watering on Thursday due to expected rainfall.",
          },
          {
            title: "Pest Alert",
            description: "The upcoming warm and humid conditions are favorable for aphid infestations. Monitor your crops closely and consider preventive measures.",
          },
          {
            title: "Harvesting Advice",
            description: "Plan your rice harvesting before Wednesday to avoid the forecasted thunderstorms which could damage mature crops.",
          },
        ],
      },
    };
  } catch (error: any) {
    console.error("Error fetching weather forecast:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch weather data.",
    };
  }
};
