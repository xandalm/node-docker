import express from 'express';
import compression from 'compression';
import { graphqlHTTP } from 'express-graphql';
import dotenv from 'dotenv';
import depthLimit from 'graphql-depth-limit';
import { simpleEstimator, createComplexityRule } from 'graphql-query-complexity';

import schema from './schema/index.js';
import ContactsGroupController from './controllers/contacts-group.js';
import Observer from './utils/observer.js';
import SimpleWSServer from './utils/simple-ws-server.js';

dotenv.config();
const app = express();
app.use(compression());
app.use(
    '/graphql',
    graphqlHTTP(async (req, res, { variables }) => ({
		schema,
		graphiql: true,
		validationRules: [
			depthLimit(10,{},depths => console.log("Query depth",depths)),
			createComplexityRule({
				estimators: [
					simpleEstimator({ defaultComplexity: 1 })
				],
				maximumComplexity: 1000,
				variables,
				onComplete: (complexity) => {
					console.log("Query complexity", complexity);
				}
			})
		]
    })),
);
app.get('/', (req, res) => res.send('GraphQL Server is running on /graphql'))

const server = app.listen(process.env.NODE_DOCKER_PORT, () => {
	console.log(`Running a GraphQL API server at localhost:${process.env.NODE_LOCAL_PORT}/graphql`);
	const path = '/subscription';
	const swss = new SimpleWSServer({server, path});
	swss.on("connection", ws => {
		let observer;
		if(observer == null)
			observer = new Observer(ws);
		ws.on("persons:watch", function() { ContactsGroupController.registerObserver(observer); });
		ws.on("persons:stop", function() { ContactsGroupController.removeObserver(observer); });
		ws.on("contacts:watch", function() { ContactsGroupController.registerObserver(observer); });
		ws.on("contacts:stop", function() { ContactsGroupController.registerObserver(observer); });
		ws.on("contacts-groups:watch", function() { ContactsGroupController.registerObserver(observer); });
		ws.on("contacts-groups:stop", function() { ContactsGroupController.registerObserver(observer); });
	})
	console.log(`WebSocketServer listening on ws://localhost:${process.env.NODE_LOCAL_PORT}${path}`)
});