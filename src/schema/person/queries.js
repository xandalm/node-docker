import { GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString } from 'graphql';

import { PersonPageType, PersonType } from './types.js';
import { OrderByInputType } from '../types.js';
import Person from '../../models/person.js';

import Filter from '../../utils/filter.js';

const PersonQueries = {
    persons: {
        type: new GraphQLNonNull(PersonPageType),
        args: {
            first: {
                type: GraphQLInt,
                defaultValue: 10
            },
            last: {
                type: GraphQLInt
            },
            orderBy: {
                type: OrderByInputType
            },
            filters: {
                type: new GraphQLList(GraphQLString)
            }
        },
        resolve: async (_, { first, last, filters }) => {

            const res = await (new Person).list(filters=Filter.from(filters).recognizedFilters);

            return {
                count: res.length,
                rows: res
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
            const person = await (new Person).getByPublicId(publicId);
            return person;
        }
    }
};

export default PersonQueries;