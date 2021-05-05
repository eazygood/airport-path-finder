import { startAirportRouteFinderServer } from "./src/airport-route-finder";
const criticalErrorHandler = (err: Error) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
};

process.on('uncaughtException', criticalErrorHandler);
process.on('unhandledRejection', criticalErrorHandler);

const startServer = async () => {
	startAirportRouteFinderServer();
}

startServer();
