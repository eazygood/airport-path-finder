import _ from "lodash";
import { AirportData } from "../repository/airports";

export class AirportDistanceCalculator {
	public static readonly EARTH_RADIUS_IN_KM = 6371

	// Haversine formula
	public static calculateDistanceBetweenAirports(sourceAiport: AirportData, destAirport: AirportData): number {
		if (_.isEmpty(sourceAiport)) {
			throw new Error('Source airport not provided');
		}

		if (_.isEmpty(destAirport)) {
			throw new Error('Destination airport not provided');
		}

		const lat1 = sourceAiport.lat;
		const lon1 = sourceAiport.lon;
		
		const lat2 = destAirport.lat;
		const lon2 = destAirport.lon;

		const R = this.EARTH_RADIUS_IN_KM;
		const φ1 = this.toRadians(lat1);
		const φ2 = this.toRadians(lat2);
		const Δφ = this.toRadians(lat2-lat1);
		const Δλ = this.toRadians(lon2-lon1);
		
		const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
				Math.cos(φ1) * Math.cos(φ2) *
				Math.sin(Δλ/2) * Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		
		const d = R * c; // in km

		if (_.isNaN(d)) {
			throw new Error('Invalid distance calculation');
		}

		return Math.abs(d);
	}

	public static toRadians(degrees: number): number {
		return degrees * Math.PI/180;
	}
}