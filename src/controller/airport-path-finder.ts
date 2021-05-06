import { AirportData, AirportsRepository } from "../repository/airports";
import { RoutesRepository } from "../repository/routes";
import { AirportDistanceCalculator } from "./airport-distance-calculator";

const TOTAL_FLIGHT_STOPS = 4;

interface AirportVertex {
    airport: AirportData;
    edges: AirportEdge[];
}

interface AirportEdge {
    node: AirportData;
    distance: number;
}

interface AirportRoute<T = {}> {
    key: string;
    vertex: AirportVertex;
    distance: number;
    stops: number;
    prev: T;
}

interface ShortestRoute {
    iata: string;
    name: string;
    distance: number;
}

type AdjacencyList = { [key: string]: AirportVertex }
type BestRoutes = { [key: string]: AirportRoute[] }

export class AirportPathFinder {
    private adjList: AdjacencyList = {};
    private airportstRepo: AirportsRepository;
    private routesRepo: RoutesRepository;

    constructor(airportstRepo: AirportsRepository, routesRepo: RoutesRepository) {
        this.airportstRepo = airportstRepo;
        this.routesRepo = routesRepo;
    }

    private getAirportVertex(iata: string): AirportVertex {
        return this.adjList[iata];
    }

    private isAirportVertexExist(iata: string): boolean {
        return !!this.adjList[iata];
    }

    private addRoute(bestRoutes: BestRoutes, route: AirportRoute): void {
        const iata = route.key
        let bestRoute = bestRoutes[iata];
        if (!bestRoute) {
            bestRoute = [];
            bestRoutes[iata] = bestRoute;
        }

        bestRoute.push(route);
    }

    private removeBestRoute(route: AirportRoute, bestRoutes: BestRoutes): void {
        const routes = bestRoutes[route.key];
        const index = routes.indexOf(route);
        routes.splice(index, 1);
    }

    private getShortestRoute(routes: AirportRoute[]): ShortestRoute[] {
        routes.sort((a, b) => a.distance - b.distance);
        const efficientRoute = routes[0];

        const formatted = this.format(efficientRoute, []);

        if (formatted.length < 2) {
            return [];
        }

        return formatted;
    }

    private format(route: AirportRoute, shortest: ShortestRoute[]): ShortestRoute[] {
        const airportRoute = route.prev as AirportRoute;

        if (airportRoute) {
            shortest.push({
                iata: route.vertex.airport.iata,
                name: route.vertex.airport.name,
                distance: route.distance,
            })
            this.format(airportRoute, shortest)
        }

        return [...shortest].reverse();
    }

    public addAirportVertex(airport: AirportData): void {
        if (this.adjList[airport.iata]) {
            return;
        }

        this.adjList[airport.iata] = {
            airport,
            edges: [],
        };
    }

    public addAirportEdge(source: AirportData, destination: AirportData, distance: number): void {
        const sourceAirportVertex: AirportVertex = this.adjList[source.iata];
        const destinationAirportVertex: AirportVertex = this.adjList[destination.iata];

        if (sourceAirportVertex) {
            if (sourceAirportVertex.edges.some(a => a.node.iata === destination.iata)) {
                return;
            }

            sourceAirportVertex.airport = source;
            sourceAirportVertex.edges = [...sourceAirportVertex.edges, {
                node: destination,
                distance
            }] as AirportEdge[];
        }

        if (destinationAirportVertex) {
            if (destinationAirportVertex.edges.some(a => a.node.iata === source.iata)) {
                return;
            }

            destinationAirportVertex.airport = destination;
            destinationAirportVertex.edges = [...destinationAirportVertex.edges, {
                node: source,
                distance
            }] as AirportEdge[];
        }
    }

    public async buildGraph(): Promise<void> {
        const airporstList = await this.airportstRepo.getAirportsDataList()
        const routesList = await this.routesRepo.getRoutesDataList();

        airporstList.forEach(airport => this.addAirportVertex(airport));
        
        routesList.forEach(routes => {
            const srcAirport = airporstList.get(routes.sourceAirportCode);
            const destAirport = airporstList.get(routes.destinationAirportCode);

            if (!srcAirport || !destAirport) {
                return;
            }

            const distance = AirportDistanceCalculator.calculateDistanceBetweenAirports(srcAirport, destAirport);

            this.addAirportEdge(srcAirport, destAirport, distance);
        });
    }

    public findShortestPath(source: string, destination: string): ShortestRoute[] {
        if (!this.isAirportVertexExist(source)) {
            throw new Error(`Airport by ${source} code not found`);
        }

        if (!this.isAirportVertexExist(destination)) {
            throw new Error(`Airport by ${destination} code not found`);
        }

        const sourceAirport: AirportRoute = {
            key: source,
            vertex: this.getAirportVertex(source) as AirportVertex,
            distance: 0,
            stops: 0,
            prev: {} as AirportRoute,
        };
        
        const destinationAirport: AirportVertex = this.getAirportVertex(destination);
        const queue = new Set<AirportRoute>();
        const bestRoutes: BestRoutes = {};
        const shortestRoutes: AirportRoute[] = [];

        // initialize best route from source airport
        this.addRoute(bestRoutes, sourceAirport);
        queue.add(sourceAirport);

        for (const route of queue) {
            if (route.vertex === destinationAirport) {
                shortestRoutes.push(route);
                continue;
            }

            if (route.stops === TOTAL_FLIGHT_STOPS) {
                continue;
            }

            const edges: AirportEdge[] = route.vertex.edges

            for (const edge of edges) {
                const iata = edge.node.iata;
                const newRoute: AirportRoute = {
                    key: iata,
                    vertex: this.getAirportVertex(iata),
                    distance: route.distance + edge.distance,
                    stops: route.stops + 1,
                    prev: route,
                };
                const currentBestRoutes: AirportRoute[] = bestRoutes[iata];

                // if best route is empty according to iata code then add it as best route and in the queue
                if (!currentBestRoutes || currentBestRoutes.length < 1) {
                    this.addRoute(bestRoutes, newRoute);
                    queue.add(newRoute);

                    continue;
                }

                let isEfficientRoute = true;

                // iterate through existence routes to check is route efficient and can be added as the best route
                for (const currentBestRoute of currentBestRoutes) {
                    if (currentBestRoute.stops > newRoute.stops && currentBestRoute.distance >= newRoute.distance) {
                        this.removeBestRoute(currentBestRoute, bestRoutes);
                        queue.delete(currentBestRoute);
                        continue;
                    }

                    if (currentBestRoute.stops === newRoute.stops) {
                        if (currentBestRoute.distance >= newRoute.distance) {
                            this.removeBestRoute(currentBestRoute, bestRoutes);
                            queue.delete(currentBestRoute);
                            continue;
                        } else {
                            isEfficientRoute = false;
                            break;
                        }
                    }

                    if (currentBestRoute.distance <= newRoute.distance) {
                        isEfficientRoute = false;
                        break;
                    }
                }

                if (!isEfficientRoute) {
                    continue;
                }


                this.addRoute(bestRoutes, newRoute);
                queue.add(newRoute);
            }
        }

        return this.getShortestRoute(shortestRoutes);
    }
}