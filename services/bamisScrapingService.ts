import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';

export interface WeatherForecast {
  id: string;
  date: string;
  period: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  rainfall: string;
  windSpeed: string;
  description: string;
  region: string;
  lastUpdated: Date;
}

export interface WeatherCaution {
  id: string;
  type: 'warning' | 'advisory' | 'alert';
  title: string;
  description: string;
  region: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  validUntil: Date;
  issuedAt: Date;
  category: 'weather' | 'crop' | 'livestock' | 'fisheries' | 'general';
}

export interface BamisData {
  forecasts: WeatherForecast[];
  cautions: WeatherCaution[];
  lastScraped: Date;
  bulletinDate: string;
  regions: string[];
}

class BamisScrapingService {
  private readonly BAMIS_URL = 'https://www.bamis.gov.bd/home/';
  private readonly STORAGE_KEY = 'bamis_data';
  private readonly LAST_NOTIFICATION_KEY = 'last_bamis_notification';
  private isScrapingInProgress = false;

  async scrapeWeatherData(): Promise<BamisData | null> {
    if (this.isScrapingInProgress) {
      console.log('Scraping already in progress, skipping...');
      return null;
    }

    this.isScrapingInProgress = true;

    try {
      console.log('Starting BAMIS data scraping...');
      
      // Fetch the webpage
      const response = await axios.get(this.BAMIS_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      const htmlContent = response.data;
      
      // Extract weather forecasts and cautions using simple text parsing
      const forecasts = this.extractWeatherForecasts(htmlContent);
      const cautions = this.extractWeatherCautions(htmlContent);
      const bulletinDate = this.extractBulletinDate(htmlContent);
      const regions = this.extractRegions(htmlContent);

      const bamisData: BamisData = {
        forecasts,
        cautions,
        lastScraped: new Date(),
        bulletinDate,
        regions
      };

      // Store the scraped data
      await this.storeBamisData(bamisData);
      
      console.log(`Successfully scraped BAMIS data: ${forecasts.length} forecasts, ${cautions.length} cautions`);
      
      return bamisData;
    } catch (error) {
      console.error('Error scraping BAMIS data:', error);
      
      // Return cached data if scraping fails
      const cachedData = await this.getCachedBamisData();
      if (cachedData) {
        console.log('Returning cached BAMIS data due to scraping error');
        return cachedData;
      }
      
      return null;
    } finally {
      this.isScrapingInProgress = false;
    }
  }

  private extractWeatherForecasts(htmlContent: string): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    
    try {
      // Simple text-based extraction for weather information
      const weatherKeywords = ['আবহাওয়া', 'তাপমাত্রা', 'বৃষ্টি', 'আর্দ্রতা', 'বাতাস'];
      const hasWeatherContent = weatherKeywords.some(keyword => htmlContent.includes(keyword));
      
      if (hasWeatherContent) {
        // Extract temperature information using regex
        const tempMatches = htmlContent.match(/(\d+)°?\s*-?\s*(\d+)°?\s*সে/g) || 
                           htmlContent.match(/(\d+)\s*থেকে\s*(\d+)\s*ডিগ্রি/g) ||
                           htmlContent.match(/(\d+)\s*-\s*(\d+)\s*°C/g);
        
        let temperature = { min: 25, max: 35 };
        if (tempMatches && tempMatches.length > 0) {
          const numbers = tempMatches[0].match(/\d+/g);
          if (numbers && numbers.length >= 2) {
            temperature = {
              min: parseInt(numbers[0]),
              max: parseInt(numbers[1])
            };
          }
        }

        // Extract humidity information
        let humidity = 70;
        const humidityMatch = htmlContent.match(/(\d+)%?\s*আর্দ্রতা/) || 
                              htmlContent.match(/আর্দ্রতা\s*(\d+)%?/);
        if (humidityMatch) {
          humidity = parseInt(humidityMatch[1]);
        }

        // Create a general forecast
        forecasts.push({
          id: `forecast_${Date.now()}`,
          date: new Date().toLocaleDateString('bn-BD'),
          period: 'আজ',
          temperature,
          humidity,
          rainfall: this.extractRainfallInfo(htmlContent),
          windSpeed: this.extractWindInfo(htmlContent),
          description: this.extractWeatherDescription(htmlContent),
          region: 'সারাদেশ',
          lastUpdated: new Date()
        });
      }

      // If no weather content found, create a default forecast
      if (forecasts.length === 0) {
        forecasts.push({
          id: `default_forecast_${Date.now()}`,
          date: new Date().toLocaleDateString('bn-BD'),
          period: 'আজ',
          temperature: { min: 25, max: 35 },
          humidity: 70,
          rainfall: 'সাধারণ',
          windSpeed: 'মৃদু',
          description: 'সাধারণ আবহাওয়া পরিস্থিতি',
          region: 'সারাদেশ',
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error extracting weather forecasts:', error);
    }

    return forecasts;
  }

  private extractWeatherCautions(htmlContent: string): WeatherCaution[] {
    const cautions: WeatherCaution[] = [];
    
    try {
      // Look for warning/caution keywords
      const cautionKeywords = ['সতর্কতা', 'সাবধান', 'এড়িয়ে', 'রোগ', 'বিপদ', 'ক্ষতি'];
      const warningKeywords = ['জরুরি', 'গুরুত্বপূর্ণ', 'অবিলম্বে'];
      
      // Check for crop-related cautions
      if (htmlContent.includes('ফসল') || htmlContent.includes('চাষ')) {
        const cropCautionMatch = htmlContent.match(/ফসল[^।]*।/g) || 
                                htmlContent.match(/চাষ[^।]*।/g);
        
        if (cropCautionMatch) {
          cropCautionMatch.forEach((match, index) => {
            if (cautionKeywords.some(keyword => match.includes(keyword))) {
              cautions.push({
                id: `crop_caution_${Date.now()}_${index}`,
                type: 'advisory',
                title: 'কৃষি পরামর্শ',
                description: match.trim(),
                region: 'সারাদেশ',
                severity: warningKeywords.some(keyword => match.includes(keyword)) ? 'high' : 'medium',
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
                issuedAt: new Date(),
                category: 'crop'
              });
            }
          });
        }
      }

      // Check for weather-related cautions
      if (htmlContent.includes('আবহাওয়া') || htmlContent.includes('বৃষ্টি')) {
        const weatherCautionMatch = htmlContent.match(/আবহাওয়া[^।]*।/g) || 
                                  htmlContent.match(/বৃষ্টি[^।]*।/g);
        
        if (weatherCautionMatch) {
          weatherCautionMatch.forEach((match, index) => {
            if (cautionKeywords.some(keyword => match.includes(keyword))) {
              cautions.push({
                id: `weather_caution_${Date.now()}_${index}`,
                type: 'warning',
                title: 'আবহাওয়া সতর্কতা',
                description: match.trim(),
                region: 'সারাদেশ',
                severity: warningKeywords.some(keyword => match.includes(keyword)) ? 'critical' : 'medium',
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
                issuedAt: new Date(),
                category: 'weather'
              });
            }
          });
        }
      }

      // If no specific cautions found but warning keywords exist, create a general caution
      if (cautions.length === 0 && cautionKeywords.some(keyword => htmlContent.includes(keyword))) {
        cautions.push({
          id: `general_caution_${Date.now()}`,
          type: 'advisory',
          title: 'সাধারণ সতর্কতা',
          description: 'কৃষি ও আবহাওয়া সংক্রান্ত সতর্কতা অবলম্বন করুন',
          region: 'সারাদেশ',
          severity: 'low',
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          issuedAt: new Date(),
          category: 'general'
        });
      }
    } catch (error) {
      console.error('Error extracting weather cautions:', error);
    }

    return cautions;
  }

  private extractBulletinDate(htmlContent: string): string {
    try {
      // Look for date patterns in Bengali
      const datePatterns = [
        /(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/,
        /(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{4})/,
        /তারিখ[:\s]*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/
      ];

      for (const pattern of datePatterns) {
        const match = htmlContent.match(pattern);
        if (match) {
          return match[0];
        }
      }

      // Fallback to current date
      return new Date().toLocaleDateString('bn-BD');
    } catch (error) {
      console.error('Error extracting bulletin date:', error);
      return new Date().toLocaleDateString('bn-BD');
    }
  }

  private extractRegions(htmlContent: string): string[] {
    const regions = new Set<string>();
    
    try {
      // Common Bangladesh regions/divisions
      const commonRegions = ['ঢাকা', 'চট্টগ্রাম', 'খুলনা', 'রাজশাহী', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
      
      commonRegions.forEach(region => {
        if (htmlContent.includes(region)) {
          regions.add(region);
        }
      });

      // If no specific regions found, add all common regions
      if (regions.size === 0) {
        commonRegions.forEach(region => regions.add(region));
      }
    } catch (error) {
      console.error('Error extracting regions:', error);
    }

    return Array.from(regions);
  }

  private extractRainfallInfo(htmlContent: string): string {
    const rainfallKeywords = ['বৃষ্টি', 'বর্ষণ', 'ঝড়'];
    
    for (const keyword of rainfallKeywords) {
      if (htmlContent.includes(keyword)) {
        if (htmlContent.includes('ভারী ' + keyword) || htmlContent.includes('প্রবল ' + keyword)) {
          return 'ভারী বৃষ্টি';
        } else if (htmlContent.includes('হালকা ' + keyword)) {
          return 'হালকা বৃষ্টি';
        } else {
          return 'সম্ভাব্য বৃষ্টি';
        }
      }
    }
    
    return 'তথ্য নেই';
  }

  private extractWindInfo(htmlContent: string): string {
    const windKeywords = ['বাতাস', 'বায়ু', 'হাওয়া'];
    
    for (const keyword of windKeywords) {
      if (htmlContent.includes(keyword)) {
        if (htmlContent.includes('প্রবল ' + keyword) || htmlContent.includes('তীব্র ' + keyword)) {
          return 'প্রবল বাতাস';
        } else if (htmlContent.includes('মৃদু ' + keyword) || htmlContent.includes('হালকা ' + keyword)) {
          return 'মৃদু বাতাস';
        } else {
          return 'সাধারণ বাতাস';
        }
      }
    }
    
    return 'তথ্য নেই';
  }

  private extractWeatherDescription(htmlContent: string): string {
    // Look for common weather descriptions
    if (htmlContent.includes('মেঘলা')) return 'মেঘলা আকাশ';
    if (htmlContent.includes('রৌদ্রোজ্জ্বল')) return 'রৌদ্রোজ্জ্বল';
    if (htmlContent.includes('বৃষ্টি')) return 'বৃষ্টির সম্ভাবনা';
    if (htmlContent.includes('ঝড়')) return 'ঝড়ের সম্ভাবনা';
    
    return 'সাধারণ আবহাওয়া';
  }

  private async storeBamisData(data: BamisData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing BAMIS data:', error);
    }
  }

  async getCachedBamisData(): Promise<BamisData | null> {
    try {
      const cachedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        // Convert date strings back to Date objects
        data.lastScraped = new Date(data.lastScraped);
        data.forecasts = data.forecasts.map((f: any) => ({
          ...f,
          lastUpdated: new Date(f.lastUpdated)
        }));
        data.cautions = data.cautions.map((c: any) => ({
          ...c,
          validUntil: new Date(c.validUntil),
          issuedAt: new Date(c.issuedAt)
        }));
        return data;
      }
    } catch (error) {
      console.error('Error retrieving cached BAMIS data:', error);
    }
    return null;
  }

  async sendNotifications(data: BamisData): Promise<void> {
    try {
      const lastNotificationTime = await AsyncStorage.getItem(this.LAST_NOTIFICATION_KEY);
      const lastNotified = lastNotificationTime ? new Date(lastNotificationTime) : new Date(0);
      const now = new Date();
      
      // Only send notifications if it's been more than 6 hours since last notification
      if (now.getTime() - lastNotified.getTime() < 6 * 60 * 60 * 1000) {
        console.log('Skipping notifications - too soon since last notification');
        return;
      }

      // Send weather forecast notification
      if (data.forecasts.length > 0) {
        const mainForecast = data.forecasts[0];
        await notificationService.sendImmediateNotification(
          'আজকের আবহাওয়া পূর্বাভাস',
          `তাপমাত্রা: ${mainForecast.temperature.min}°-${mainForecast.temperature.max}°সে, ${mainForecast.description}`,
          {
            type: 'weather_forecast',
            forecastId: mainForecast.id
          },
          'weather-alerts'
        );
      }

      // Send high priority cautions
      const highPriorityCautions = data.cautions.filter(c => 
        c.severity === 'high' || c.severity === 'critical'
      );

      for (const caution of highPriorityCautions.slice(0, 3)) { // Limit to 3 notifications
        await notificationService.sendImmediateNotification(
          caution.title,
          caution.description,
          {
            type: 'weather_caution',
            cautionId: caution.id,
            severity: caution.severity
          },
          'weather-alerts'
        );
      }

      // Update last notification time
      await AsyncStorage.setItem(this.LAST_NOTIFICATION_KEY, now.toISOString());
      
      console.log(`Sent ${1 + highPriorityCautions.length} BAMIS notifications`);
    } catch (error) {
      console.error('Error sending BAMIS notifications:', error);
    }
  }

  async getLatestData(): Promise<BamisData | null> {
    // First try to get cached data
    const cachedData = await this.getCachedBamisData();
    
    // If no cached data or data is older than 6 hours, scrape new data
    if (!cachedData || 
        (new Date().getTime() - cachedData.lastScraped.getTime()) > 6 * 60 * 60 * 1000) {
      console.log('Cached data is stale or missing, scraping fresh data...');
      const freshData = await this.scrapeWeatherData();
      return freshData || cachedData;
    }
    
    return cachedData;
  }

  async forceRefresh(): Promise<BamisData | null> {
    console.log('Force refreshing BAMIS data...');
    return await this.scrapeWeatherData();
  }
}

export const bamisScrapingService = new BamisScrapingService();
export default bamisScrapingService;
