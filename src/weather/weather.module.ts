import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './weather.service';
import { WeatherGateway } from './weather.gateway';

@Module({
  imports: [HttpModule],
  providers: [WeatherService, WeatherGateway],
})
export class WeatherModule {}
