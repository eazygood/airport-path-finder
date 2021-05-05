import { getFormattedAirportsData } from "../database/in-memory";

export interface AirportData {
	name: string;
	iata: string;
	lat: number;
	lon: number;
	distance?: number;
}

export type AirportDataListMap = Map<string, AirportData>;

export class AirportsRepository {
	public async getAirportsDataList(): Promise<AirportDataListMap> {
		return getFormattedAirportsData();
	}
}