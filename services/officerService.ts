export interface Officer {
  id: string;
  name: string;
  designation: string;
  phone?: string;
  email?: string;
  office: string;
  region: string;
  district?: string;
  upazila?: string;
  imageUrl?: string;
}

export interface RegionalOffice {
  region: string;
  districts: string[];
  officers: Officer[];
}

import { scrapeAllDaeWebsites, updateOfficerServiceWithScrapedData } from './daeScrapingService';

// Enhanced mock data with more realistic information based on DAE structure
export let regionalOffices: RegionalOffice[] = [
  {
    region: "Dhaka",
    districts: ["Dhaka", "Faridpur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Rajbari", "Shariatpur", "Tangail"],
    officers: [
      {
        id: "dhaka-001",
        name: "Dr. Mohammad Rahman",
        designation: "Director (DAE), Dhaka Division",
        phone: "01711-123456",
        email: "director.dhaka@dae.gov.bd",
        office: "DAE Dhaka Division Office",
        region: "Dhaka",
        district: "Dhaka",
        imageUrl: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=DR"
      },
      {
        id: "dhaka-002",
        name: "Md. Abdul Karim",
        designation: "Additional Director (Extension)",
        phone: "01711-234567",
        email: "add.director.dhaka@dae.gov.bd",
        office: "DAE Dhaka Division Office",
        region: "Dhaka",
        district: "Dhaka",
        imageUrl: "https://via.placeholder.com/150/2196F3/FFFFFF?text=AK"
      },
      {
        id: "dhaka-003",
        name: "Mrs. Fatema Begum",
        designation: "Deputy Director (Training)",
        phone: "01711-345678",
        email: "dd.training.dhaka@dae.gov.bd",
        office: "DAE Training Institute, Dhaka",
        region: "Dhaka",
        district: "Dhaka",
        imageUrl: "https://via.placeholder.com/150/FF9800/FFFFFF?text=FB"
      }
    ]
  },
  {
    region: "Chittagong",
    districts: ["Chittagong", "Bandarban", "Brahmanbaria", "Chandpur", "Comilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
    officers: [
      {
        id: "ctg-001",
        name: "Dr. Ahmed Hassan",
        designation: "Director (DAE), Chittagong Division",
        phone: "01711-456789",
        email: "director.chittagong@dae.gov.bd",
        office: "DAE Chittagong Division Office",
        region: "Chittagong",
        district: "Chittagong",
        imageUrl: "https://via.placeholder.com/150/9C27B0/FFFFFF?text=AH"
      },
      {
        id: "ctg-002",
        name: "Md. Rafiqul Islam",
        designation: "Additional Director (Research)",
        phone: "01711-567890",
        email: "add.director.ctg@dae.gov.bd",
        office: "DAE Chittagong Division Office",
        region: "Chittagong",
        district: "Chittagong",
        imageUrl: "https://via.placeholder.com/150/795548/FFFFFF?text=RI"
      }
    ]
  },
  {
    region: "Faridpur",
    districts: ["Faridpur", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
    officers: [
      {
        id: "far-001",
        name: "Dr. Nasir Uddin",
        designation: "Director (DAE), Faridpur Region",
        phone: "01711-678901",
        email: "director.faridpur@dae.gov.bd",
        office: "DAE Faridpur Regional Office",
        region: "Faridpur",
        district: "Faridpur",
        imageUrl: "https://via.placeholder.com/150/607D8B/FFFFFF?text=NU"
      }
    ]
  },
  {
    region: "Mymensingh",
    districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
    officers: [
      {
        id: "mym-001",
        name: "Dr. Shahidul Islam",
        designation: "Director (DAE), Mymensingh Division",
        phone: "01711-789012",
        email: "director.mymensingh@dae.gov.bd",
        office: "DAE Mymensingh Division Office",
        region: "Mymensingh",
        district: "Mymensingh",
        imageUrl: "https://via.placeholder.com/150/E91E63/FFFFFF?text=SI"
      }
    ]
  },
  {
    region: "Gazipur",
    districts: ["Gazipur", "Narsingdi"],
    officers: [
      {
        id: "gaz-001",
        name: "Md. Aminul Haque",
        designation: "District Agriculture Officer",
        phone: "01711-890123",
        email: "dao.gazipur@dae.gov.bd",
        office: "DAE Gazipur District Office",
        region: "Gazipur",
        district: "Gazipur",
        imageUrl: "https://via.placeholder.com/150/009688/FFFFFF?text=AH"
      }
    ]
  }
];

export const findOfficersByLocation = (userLocation: string): Officer[] => {
  const location = userLocation.toLowerCase();
  
  // Find officers by district match
  const matchingOfficers: Officer[] = [];
  
  regionalOffices.forEach(office => {
    // Check if user location matches any district in this region
    const matchingDistrict = office.districts.find(district => 
      district.toLowerCase().includes(location) || 
      location.includes(district.toLowerCase())
    );
    
    if (matchingDistrict) {
      matchingOfficers.push(...office.officers);
    }
  });
  
  // If no exact match, return all officers (fallback)
  if (matchingOfficers.length === 0) {
    return regionalOffices.flatMap(office => office.officers);
  }
  
  return matchingOfficers;
};

export const getAllOfficers = (): Officer[] => {
  return regionalOffices.flatMap(office => office.officers);
};

export const getRegionalOffices = (): RegionalOffice[] => {
  return regionalOffices;
};

export const getOfficersByRegion = (region: string): Officer[] => {
  const office = regionalOffices.find(office => 
    office.region.toLowerCase() === region.toLowerCase()
  );
  return office ? office.officers : [];
};

// Function to attempt scraping and update officer data
export const updateOfficerDataFromScraping = async (): Promise<boolean> => {
  try {
    console.log('Attempting to scrape DAE websites...');
    const scrapedOfficers = await scrapeAllDaeWebsites();
    
    if (scrapedOfficers.length > 0) {
      console.log(`Successfully scraped ${scrapedOfficers.length} officers`);
      const updatedRegionalOffices = updateOfficerServiceWithScrapedData(scrapedOfficers);
      
      // Merge with existing mock data to ensure we have comprehensive coverage
      regionalOffices = mergeOfficerData(regionalOffices, updatedRegionalOffices);
      
      console.log('Officer data updated with scraped information');
      return true;
    } else {
      console.log('No officers scraped, using mock data');
      return false;
    }
  } catch (error) {
    console.error('Error updating officer data from scraping:', error);
    return false;
  }
};

// Function to merge scraped data with existing mock data
const mergeOfficerData = (existing: RegionalOffice[], scraped: RegionalOffice[]): RegionalOffice[] => {
  const merged = [...existing];
  
  scraped.forEach(scrapedOffice => {
    const existingOfficeIndex = merged.findIndex(office => 
      office.region.toLowerCase() === scrapedOffice.region.toLowerCase()
    );
    
    if (existingOfficeIndex >= 0) {
      // Replace existing officers with scraped data for this region
      merged[existingOfficeIndex].officers = scrapedOffice.officers;
    } else {
      // Add new regional office
      merged.push(scrapedOffice);
    }
  });
  
  return merged;
};

// Function to initialize officer data (call this on app startup)
export const initializeOfficerData = async (): Promise<void> => {
  // Try to update with scraped data, but don't block the app if it fails
  try {
    await updateOfficerDataFromScraping();
  } catch (error) {
    console.log('Using mock officer data due to scraping failure');
  }
};
