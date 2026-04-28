import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { WeatherService } from './weather.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class WeatherGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WeatherGateway.name);
  private interval: NodeJS.Timeout | undefined;

  constructor(private readonly weatherService: WeatherService) {}

  async handleConnection(client: WebSocket) {
    this.logger.log('Client connected');
    
    // Send initial weather data
    const data = await this.weatherService.getWeatherData();
    if (data) {
      client.send(JSON.stringify({ type: 'weather_update', data }));
    }

    // Start polling if not already started
    if (!this.interval) {
      this.interval = setInterval(async () => {
        const newData = await this.weatherService.getWeatherData();
        if (newData) {
          const payload = JSON.stringify({ type: 'weather_update', data: newData });
          this.server.clients.forEach((c) => {
            if (c.readyState === 1) { // 1 is OPEN
              c.send(payload);
            }
          });
        }
      }, 60000); // Poll every minute
    }
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('Client disconnected');
    if (this.server.clients.size === 0 && this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
