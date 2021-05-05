import _ from 'lodash';
import config from '../../config/config.json';
import { httpRequest, HttpRequestResponse } from '../http-request';
import { AirportData, AirportDataListMap } from '../repository/airports';
import { RouteData } from '../repository/routes';

const rawDataSetHost = config.dataset.host;
const rawDatasetOfAirportsPath = config.dataset.airports;
const rawDatasetOfRoutesPath = config.dataset.routes;

interface OpenFlightsRawData {
	data: string;
}

const findIataCode = (line: string): string | null => {
	const val = line.match(/"\w{3}"/g);

	return !_.isNull(val) ? val[0].replace(/['"]+/g, '') : null;
}

const findLatLon = (line: string): string[] | [] => {
	const val = line.match(/-?[0-9\\.]+,-?[0-9\\.]+/s) || [];

	return !_.isEmpty(val) ? val[0].split(',') : val;
}

const findAirportName = (line: string): string | null => {
	const name = line.match(/"([^"]*)"/g);

	return !_.isNull(name) ? name[0].replace(/['"]+/g, '') : null;
}

const populateRawAirportData = (airportsLines: string[]): AirportDataListMap => {
	const airportDataMap: AirportDataListMap = new Map<string, AirportData>();

	airportsLines.map(line => {
		const iata = findIataCode(line);

		if (!iata) {
			return;
		}

		if (!airportDataMap.has(iata)) {
			const [lat, lon] = findLatLon(line);
			airportDataMap.set(iata, {
				name: findAirportName(line) || '',
				iata,
				lat: parseFloat(lat),
				lon: parseFloat(lon),
			})
		}
	})

	return airportDataMap;
}

const getFormattedAirportsData = async (): Promise<AirportDataListMap> => {
	const opt = {
		host: rawDataSetHost,
		path: rawDatasetOfAirportsPath,
		method: 'GET',
		rejectUnauthorized: false
	}

	const response: HttpRequestResponse<OpenFlightsRawData> = await httpRequest(opt);
	const data = (<string>response.data).split('\n');
	
	return populateRawAirportData(data);
}

const getFormattedRoutesData = async (): Promise<RouteData[]> => {
	const opt = {
		host: rawDataSetHost,
		path: rawDatasetOfRoutesPath,
		method: 'GET',
		rejectUnauthorized: false
	}

	const response: HttpRequestResponse<OpenFlightsRawData> = await httpRequest(opt);
	const data = (<string>response.data).split('\n')
	const routesData: RouteData[] = data.map(line => {
		const routesData = line.split(',');

		return {
			sourceAirportCode:  routesData[2],
			destinationAirportCode:  routesData[4],
		}
	});

	return routesData;
}

export { getFormattedAirportsData, getFormattedRoutesData }