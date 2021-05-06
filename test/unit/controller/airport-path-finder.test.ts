import assert from 'assert';
import * as sinon from 'sinon';
import { AirportDataListMap, AirportsRepository } from "../../../src/repository/airports";
import { AirportPathFinder } from '../../../src/controller/airport-path-finder';
import { RoutesRepository } from '../../../src/repository/routes';
import airports from '../testData/airports.json';
import routes from '../testData/routes.json';

const prepareAirportsData = (): AirportDataListMap => {
	const airporData = new Map() as AirportDataListMap;

	airports.map(airport => airporData.set(airport.iata, {
		name: airport.name,
		iata: airport.iata,
		lat: airport.lat,
		lon: airport.lon
	}))

	return airporData;
}

describe('AiportPathFinder', () => {
	const airporData = prepareAirportsData();
	let airportPathFinder;
	let airportRepositoryMock;
	let routesRepositoryMock;

	beforeEach(async () => {
		airportRepositoryMock = {
			getAirportsDataList: sinon.stub().resolves(airporData),
		};

		routesRepositoryMock = {
			getRoutesDataList: sinon.stub().resolves(routes),
		}

		airportPathFinder = new AirportPathFinder(airportRepositoryMock as AirportsRepository, routesRepositoryMock as RoutesRepository);
		await airportPathFinder.buildGraph()
	});


	it('returns shortest path from TLL to KMG', async () => {
		await airportPathFinder.buildGraph()
		const shortestPath = airportPathFinder.findShortestPath('TLL', 'KMG');

		assert.deepStrictEqual(shortestPath, [{
			iata: 'TLL',
			name: 'Lennart Meri Tallinn Airport',
			distance: 0
		},
		{
			iata: 'SVO',
			name: 'Sheremetyevo International Airport',
			distance: 838.1110309895047
		},
		{
			iata: 'URC',
			name: 'Ürümqi Diwopu International Airport',
			distance: 4566.756181952005
		},
		{
			iata: 'CTU',
			name: 'Chengdu Shuangliu International Airport',
			distance: 6638.253206762427
		},
		{
			iata: 'KMG',
			name: 'Kunming Changshui International Airport',
			distance: 7255.37573081353
		}])
	});

	it('returns shortest path from TLL to DUB', async () => {
		const shortestPath = airportPathFinder.findShortestPath('TLL', 'DUB');

		assert.deepStrictEqual(shortestPath, [{
			iata: 'TLL',
			name: 'Lennart Meri Tallinn Airport',
			distance: 0
		},
		{
			iata: 'ARN',
			name: 'Stockholm-Arlanda Airport',
			distance: 390.55438224965013
		},
		{
			iata: 'DUB',
			name: 'Dublin Airport',
			distance: 2015.305541839799
		}])
	});

	it('returns src airport if dest is the same airport', async () => {
		const shortestPath = airportPathFinder.findShortestPath('TLL', 'TLL');

		assert.deepStrictEqual(shortestPath, [])
	});

	it('throws error if src iata code not found', async () => {
		try {
			airportPathFinder.findShortestPath('NUBLU', 'TLL')
		} catch (err) {
			assert.strictEqual(err.message, 'Airport by NUBLU code not found');
		}
	});

	it('throws error if dest iata code not found', async () => {
		try {
			airportPathFinder.findShortestPath('TLL', 777)
		} catch (err) {
			assert.strictEqual(err.message, 'Airport by 777 code not found');
		}
	});
});