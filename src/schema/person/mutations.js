import { GraphQLNonNull, GraphQLBoolean, GraphQLString } from 'graphql';
import PersonController from '../../controllers/person.js';

import { PersonType } from "./types.js";
import { PersonInputType } from './types.js';

const PersonMutations = {
    createPerson: {
        type: PersonType,
        args: {
            input: {
                type: new GraphQLNonNull(PersonInputType)
            }
        },
        resolve: (_, { input }) => PersonController.createPerson(input)
    },
    updatePerson: {
        type: PersonType,
        args: {
            input: {
                type: new GraphQLNonNull(PersonInputType)
            }
        },
        resolve: (_, { input }) => PersonController.updatePerson(input)
    },
    deletePerson: {
        type: GraphQLBoolean,
        args: {
            PID: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { PID }) => PersonController.deletePerson(PID)
    }
}

export default PersonMutations;