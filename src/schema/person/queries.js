import { GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString } from 'graphql';

import { PersonPageType, PersonType } from './types.js';
import { OrderByInputType, QueryConditionInputType } from '../types.js';
import Person from '../../models/person.js';

import { Condition } from '../../utils/condition.js';
import { OrderBy } from '../../utils/order.js';

const PersonQueries = {
    persons: {
        type: new GraphQLNonNull(PersonPageType),
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: QueryConditionInputType },
            orderBy: { type: OrderByInputType }
        },
        resolve: async (_, { page, limit, where, orderBy }) => {
            const person = new Person;
            const condition = Condition.from(where);
            const res = person.list({ page, limit, condition, orderBy: OrderBy.from(orderBy) });
            const totalInCondition = person.count(condition);
            const totalAll = person.count();
            return {
                rows: res,
                totalInCondition,
                totalAll
            };
        }
    },
    person: {
        type: PersonType,
        args: {
            publicId: {
                type: GraphQLString
            }
        },
        resolve: async (_, { publicId }) => {
            const person = (new Person).getByPublicId(publicId);
            return person;
        }
    }
};

export default PersonQueries;