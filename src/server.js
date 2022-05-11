import express from 'express';
import compression from 'compression';
import graphql, { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import dotenv from 'dotenv';

import schema from './schema/index.js';
import Person from './models/person.js';

dotenv.config();

const app = express();
app.use(compression());
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

const PORT = process.env.NODE_DOCKER_PORT || 8080;

app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});