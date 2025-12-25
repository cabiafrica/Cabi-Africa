import { Injectable } from '@nestjs/common';

@Injectable()
export class MapService {

    // Mock data for airport terminals
    private airportData = {
        'JFK': {
            airlines: {
                'Delta': { terminal: 'Terminal 4', door: 'Door 2 (Departures)' },
                'JetBlue': { terminal: 'Terminal 5', door: 'Door 1' },
                'American': { terminal: 'Terminal 8', door: 'Door 3' },
            }
        },
        'LHR': {
            airlines: {
                'British Airways': { terminal: 'Terminal 5', door: 'Zone A' },
                'Virgin Atlantic': { terminal: 'Terminal 3', door: 'Zone C' },
            }
        }
    };

    async getAirlineDropoff(airportCode: string, airline: string) {
        const airport = this.airportData[airportCode];
        if (!airport) return null;

        const dropoff = airport.airlines[airline];
        if (!dropoff) return null;

        return {
            airport: airportCode,
            airline,
            ...dropoff,
            instruction: `Proceed to ${dropoff.terminal}, ${dropoff.door}.`
        };
    }

    // Method to check if a location is an airport (Mock)
    async isAirport(latitude: number, longitude: number): Promise<string | null> {
        // Mock check
        if (Math.abs(latitude - 40.6413) < 0.05 && Math.abs(longitude - -73.7781) < 0.05) {
            return 'JFK';
        }
        return null;
    }
}
