import { GraphQLNonNull, GraphQLInt, GraphQLString } from 'graphql';

import { PersonPageType, PersonType } from './types.js';
import { OrderByInputType, QueryConditionInputType } from '../types.js';
import PersonController from '../../controllers/person.js';

const PersonQueries = {
    persons: {
        type: new GraphQLNonNull(PersonPageType),
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: QueryConditionInputType },
            orderBy: { type: OrderByInputType }
        },
        resolve: (_, { page, limit, where, orderBy }) => PersonController.getPersons(page, limit, where, orderBy)
    },
    person: {
        type: PersonType,
        args: {
            PID: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { PID }) => PersonController.getUniquePerson(PID)
    }
};

export default PersonQueries;