import assert from 'assert';
import { AirportDistanceCalculator } from "../../../src/controller/airport-distance-calculator";
import { AirportData } from "../../../src/repository/airports";

describe('AiportDistanceCalculator', () => {
	let source: AirportData;
	let destination: AirportData;

	beforeEach(() => {
		source = {
			name: 'Tallinn Airport',
			iata: 'TLL',
			lat: 58.99079895019531,
			lon: 22.830699920654297,
			distance: 0,
		}

		destination = {
			name: 'Dublin Airport',
			iata: 'DUB',
			lat: 53.421299,
			lon: -6.27007,
			distance: 0,
		}
	});

	it('returns calculated distance in km by Haversine formula', () => {
		const distance = AirportDistanceCalculator.calculateDistanceBetweenAirports(source, destination);
		assert.strictEqual(distance, 1885.5213994312614);
	})

	it('throws error if source or destination airport not provided', () => {
		try {
			AirportDistanceCalculator.calculateDistanceBetweenAirports({} as AirportData, {} as AirportData)
		} catch (err) {
			assert.strictEqual(err.message, 'Source airport not provided');
		}
	})

	it('throws error if calculation returns NaN', () => {
		try {
			AirportDistanceCalculator.calculateDistanceBetweenAirports({ lat: 'hello', lon: 'world' } as never, destination)
		} catch (err) {
			assert.strictEqual(err.message, 'Invalid distance calculation');
		}
	})
})