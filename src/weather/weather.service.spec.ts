import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch and format weather data', async () => {
    const mockResponse = {
      data: {
        current_weather: { temperature: 20 },
        hourly: {
          time: [new Date().toISOString(), new Date(Date.now() + 3600000).toISOString()],
          temperature_2m: [20, 21],
          weathercode: [0, 1]
        }
      }
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

    const result = await service.getWeatherData();
    expect(result).toBeDefined();
    expect(result.current.temperature).toBe(20);
    expect(result.forecast.length).toBeGreaterThan(0);
  });
});
