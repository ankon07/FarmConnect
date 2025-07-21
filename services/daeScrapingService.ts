import { Officer, RegionalOffice } from './officerService';

export interface ScrapingResult {
  success: boolean;
  data?: Officer[];
  error?: string;
}

// URLs to scrape
export const DAE_URLS = [
  'https://dae.dhaka.gov.bd/en/site/view/OfficerList',
  'https://dae.chittagong.gov.bd/en/site/view/OfficerList',
  'https://dae-farreg.dhakadiv.gov.bd/en/site/view/OfficerList',
  'https://dae.mymensinghdiv.gov.bd/en/site/view/OfficerList',
  'https://dae.gazipur.gov.bd/en/site/view/OfficerList'
];

// Function to scrape a single DAE website
export const scrapeDaeWebsite = async (url: string): Promise<ScrapingResult> => {
  try {
    // This would use a proper scraping library in a real implementation
    // For now, we'll simulate the scraping process
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the HTML to extract officer information
    const officers = parseOfficerData(html, url);
    
    return {
      success: true,
      data: officers
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to parse HTML and extract officer data
const parseOfficerData = (html: string, sourceUrl: string): Officer[] => {
  const officers: Officer[] = [];
  
  try {
    // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
    // like cheerio or jsdom to extract structured data
    
    // Determine region from URL
    let region = 'Unknown';
    if (sourceUrl.includes('dhaka.gov.bd')) region = 'Dhaka';
    else if (sourceUrl.includes('chittagong.gov.bd')) region = 'Chittagong';
    else if (sourceUrl.includes('farreg.dhakadiv.gov.bd')) region = 'Faridpur';
    else if (sourceUrl.includes('mymensinghdiv.gov.bd')) region = 'Mymensingh';
    else if (sourceUrl.includes('gazipur.gov.bd')) region = 'Gazipur';
    
    // Look for common patterns in DAE websites
    const namePattern = /<td[^>]*>([^<]*(?:Dr\.|Mr\.|Mrs\.|Ms\.)[^<]*)<\/td>/gi;
    const designationPattern = /<td[^>]*>([^<]*(?:Director|Additional Director|Deputy Director|Assistant Director|Agriculture Officer)[^<]*)<\/td>/gi;
    const phonePattern = /<td[^>]*>([0-9\-\+\s\(\)]{10,})<\/td>/gi;
    const emailPattern = /<td[^>]*>([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})<\/td>/gi;
    
    // Extract data using regex patterns
    let nameMatch;
    let designationMatch;
    let phoneMatch;
    let emailMatch;
    
    const names: string[] = [];
    const designations: string[] = [];
    const phones: string[] = [];
    const emails: string[] = [];
    
    while ((nameMatch = namePattern.exec(html)) !== null) {
      names.push(nameMatch[1].trim());
    }
    
    while ((designationMatch = designationPattern.exec(html)) !== null) {
      designations.push(designationMatch[1].trim());
    }
    
    while ((phoneMatch = phonePattern.exec(html)) !== null) {
      phones.push(phoneMatch[1].trim());
    }
    
    while ((emailMatch = emailPattern.exec(html)) !== null) {
      emails.push(emailMatch[1].trim());
    }
    
    // Combine the extracted data into officer objects
    const maxLength = Math.max(names.length, designations.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (names[i] && designations[i]) {
        officers.push({
          id: `${region.toLowerCase()}-scraped-${i + 1}`,
          name: names[i],
          designation: designations[i],
          phone: phones[i] || undefined,
          email: emails[i] || undefined,
          office: `DAE ${region} Office`,
          region: region,
          imageUrl: `https://via.placeholder.com/150/4CAF50/FFFFFF?text=${names[i].split(' ').map(n => n[0]).join('')}`
        });
      }
    }
    
  } catch (error) {
    console.error('Error parsing officer data:', error);
  }
  
  return officers;
};

// Function to scrape all DAE websites
export const scrapeAllDaeWebsites = async (): Promise<Officer[]> => {
  const allOfficers: Officer[] = [];
  
  for (const url of DAE_URLS) {
    console.log(`Scraping ${url}...`);
    const result = await scrapeDaeWebsite(url);
    
    if (result.success && result.data) {
      allOfficers.push(...result.data);
      console.log(`Successfully scraped ${result.data.length} officers from ${url}`);
    } else {
      console.error(`Failed to scrape ${url}: ${result.error}`);
    }
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return allOfficers;
};

// Function to save scraped data to a JSON file
export const saveScrapedData = async (officers: Officer[]): Promise<void> => {
  try {
    const data = {
      lastUpdated: new Date().toISOString(),
      totalOfficers: officers.length,
      officers: officers
    };
    
    // In a real app, you'd save this to a database or file
    console.log('Scraped data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving scraped data:', error);
  }
};

// Function to update officer service with scraped data
export const updateOfficerServiceWithScrapedData = (officers: Officer[]): RegionalOffice[] => {
  const regionalOffices: RegionalOffice[] = [];
  
  // Group officers by region
  const officersByRegion = officers.reduce((acc, officer) => {
    if (!acc[officer.region]) {
      acc[officer.region] = [];
    }
    acc[officer.region].push(officer);
    return acc;
  }, {} as Record<string, Officer[]>);
  
  // Create regional office objects
  Object.entries(officersByRegion).forEach(([region, regionOfficers]) => {
    // Define districts for each region based on administrative divisions
    let districts: string[] = [];
    
    switch (region) {
      case 'Dhaka':
        districts = ['Dhaka', 'Faridpur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Rajbari', 'Shariatpur', 'Tangail'];
        break;
      case 'Chittagong':
        districts = ['Chittagong', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Comilla', "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'];
        break;
      case 'Faridpur':
        districts = ['Faridpur', 'Barisal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'];
        break;
      case 'Mymensingh':
        districts = ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'];
        break;
      case 'Gazipur':
        districts = ['Gazipur', 'Narsingdi'];
        break;
      default:
        districts = [region];
    }
    
    regionalOffices.push({
      region,
      districts,
      officers: regionOfficers
    });
  });
  
  return regionalOffices;
};
