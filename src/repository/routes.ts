import { getFormattedRoutesData } from "../database/in-memory";

export interface RouteData {
	sourceAirportCode: string; // iata (3-letter) or icao (4-letter)
	destinationAirportCode: string; // iata (3-letter) or icao (4-letter)
	distance?: number | null;
}

export class RoutesRepository {
	public async getRoutesDataList(): Promise<RouteData[]> {
		return getFormattedRoutesData();
	}
}