import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  
  // Coordinates for Benito Juarez, Mexico City
  private readonly lat = 19.3850;
  private readonly lon = -99.1631;

  constructor(private readonly httpService: HttpService) {}

  async getWeatherData() {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current_weather=true&hourly=temperature_2m,weathercode&timezone=auto`;
      const response = await firstValueFrom(this.httpService.get(url));
      
      const data = response.data;
      
      // Parse the next 8 hours of data
      const currentHourIndex = data.hourly.time.findIndex(
        (time: string) => new Date(time).getTime() >= new Date().getTime()
      ) || 0;
      
      const next8Hours = data.hourly.time.slice(currentHourIndex, currentHourIndex + 8).map((time: string, i: number) => ({
        time,
        temperature: data.hourly.temperature_2m[currentHourIndex + i],
        weathercode: data.hourly.weathercode[currentHourIndex + i],
      }));

      return {
        current: data.current_weather,
        forecast: next8Hours,
      };
    } catch (error) {
      this.logger.error('Failed to fetch weather data', error);
      return null;
    }
  }
}
