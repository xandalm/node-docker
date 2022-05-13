import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

import { ContactsGroupPageType, ContactsGroupNonOwnerPageType } from './types.js';
import ContactsGroup from '../../models/contacts-group.js';
import Filter from '../../utils/filter.js';
import { PersonInputType } from '../person/types.js';
import Person from '../../models/person.js';

const ContactsGroupQueries = {
    contactsGroups: {
        type: new GraphQLNonNull(ContactsGroupPageType),
        args: {
            first: {
                type: GraphQLInt,
                defaultValue: 10
            },
            last: { type: GraphQLInt },
            filters: {
                type: new GraphQLList(GraphQLString)
            }
        },
        resolve: async (_, { first, last, filters }) => {
            const res = await (new ContactsGroup).list(filters=Filter.from(filters).recognizedFilters);
            return {
                count: res.length,
                rows: res
            };
        }
    },
    personContactsGroups: {
        type: new GraphQLNonNull(ContactsGroupNonOwnerPageType),
        args: {
            first: {
                type: GraphQLInt,
                default: 10
            },
            owner: { type: PersonInputType },
            last: { type: GraphQLInt },
            filters: {
                type: new GraphQLList(GraphQLString)
            }
        },
        resolve: async (_, { first, last, owner, filters }) => {
            const person = new Person();
            person.public_id = owner.publicId;
            const res = await (new ContactsGroup).listByPerson(person,filters=Filter.from(filters).recognizedFilters);
            return {
                count: res.length,
                rows: res
            };
        }
    }
};

export default ContactsGroupQueries;