import express from 'express';
import { json } from 'body-parser';
import { Server } from 'http';
import config from '../config/config.json';
import { AirportsRepository } from './repository/airports';
import { RoutesRepository } from './repository/routes';
import { AirportPathFinder } from './controller/airport-path-finder';

const app = express();

app.use(json({ limit: '69mb' }));

const buildAirportPathFinderGraph = async (): Promise<AirportPathFinder> => {
	const airportRepo = new AirportsRepository();
	const routesRepo = new RoutesRepository();
	const finder = new AirportPathFinder(airportRepo, routesRepo);

	await finder.buildGraph();

	return finder;
}

const startAirportRouteFinderServer = (): Server => {
	const port = config.server.port || 80;

	console.info(`airport route finder server on port: ${port}`);

	return app.listen(port);
}

const initRoutes = async (): Promise<void> => {
	const finder: AirportPathFinder = await buildAirportPathFinderGraph();

	app.get('/route', (req, res) => {
		const src: string = req.query.src as string;
		const dest: string = req.query.dest as string;
	
		if (!src || !dest) {
			res.status(500);
			res.send({status: 'IATA codes not provided'});
			return;
		}
	
		try {
			const path = finder.findShortestPath(src.toUpperCase(), dest.toUpperCase());
	
			res.status(200);
			res.json({data: path});
		} catch (err) {
			res.status(500);
			res.json({error: err.message});
		}
	})
}

export {
	startAirportRouteFinderServer,
	initRoutes
}

