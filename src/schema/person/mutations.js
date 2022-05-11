import { GraphQLNonNull, GraphQLBoolean, GraphQLString } from 'graphql';
import Person from '../../models/person.js';

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
        resolve: async (_, args) => {
            const { input } = args;
            const person = new Person();
            person.first_name=input.firstName;
            person.last_name=input.lastName;
            person.birthday=input.birthday;
            person.email=input.email;
            if(await person.insert())
                return person
            return null;
        }
    },
    updatePerson: {
        type: PersonType,
        args: {
            input: {
                type: new GraphQLNonNull(PersonInputType)
            }
        },
        resolve: async (_, args) => {
            const { input } = args;
            const person = (new Person).getByPublicId(input.publicId);
            if(person) {
                person.first_name=input.firstName;
                person.last_name=input.lastName;
                person.birthday=input.birthday;
                person.email=input.email;
                if(await person.update()) 
                    return person;
            }
            return null;
        }
    },
    deletePerson: {
        type: GraphQLBoolean,
        args: {
            input: {
                type: new GraphQLNonNull(PersonInputType)
            }
        },
        resolve: async (_, args) => {
            const { input } = args;
            const person = (new Person).getByPublicId(input.publicId);
            return await person.delete();
        }
    }
}

export default PersonMutations;