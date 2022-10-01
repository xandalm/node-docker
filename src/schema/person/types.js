import { 
    GraphQLObjectType, GraphQLInputObjectType, 
    GraphQLNonNull, GraphQLList, GraphQLString, 
    GraphQLInt, GraphQLBoolean 
} from 'graphql';
import Contact from '../../models/contact.js';
import ContactsGroup from '../../models/contacts-group.js';
import Person from '../../models/person.js';
import { ContactType } from '../contacts/types.js';
import { ContactsGroupType } from '../contacts_group/types.js';

const PersonInputType = new GraphQLInputObjectType({
    name: 'PersonInput',
    description: 'Input to build person in server side',
    fields: () => ({
        publicId: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        birthday: { type: GraphQLString },
        email: { type: GraphQLString }
    })
});

const PersonTypeSimplified = new GraphQLObjectType({
    name: 'PersonSimplified',
    fields: () => ({
        publicId: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.public_id;
            }
        },
        name: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.name;
            }
        },
        firstName: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.first_name;
            }
        },
        lastName: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.last_name;
            }
        },
        birthday: { 
            type: GraphQLString,
            resolve: (obj) => {
                return obj.birthday?.toISOString();
            }
        },
        email: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.email;
            }
        }
    })
})

const PersonType = new GraphQLObjectType({
    name: 'Person',
    fields: () => ({
        publicId: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.public_id;
            }
        },
        name: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.name;
            }
        },
        firstName: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.first_name;
            }
        },
        lastName: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.last_name;
            }
        },
        birthday: { 
            type: GraphQLString,
            resolve: (obj) => {
                return obj.birthday?.toISOString();
            }
        },
        email: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.email;
            }
        },
        status: {
            type: GraphQLBoolean,
            resolve: (obj) => {
                return obj.status;
            }
        },
        contacts: {
            type: new GraphQLList(ContactType),
            resolve: (obj) => {
                return (new Contact).listByOwner(obj);
            }
        },
        contactsGroups: {
            type: new GraphQLList(ContactsGroupType),
            resolve: (obj) => {
                return (new ContactsGroup).listByOwner(obj);
            }
        },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment?.toISOString();
            }
        },
        deletedMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.deleted_moment?.toISOString();
            }
        },
    })
});

const PersonPageType = new GraphQLObjectType({
    name: 'PersonsPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(PersonType)) },
        totalInCondition: { type: GraphQLInt },
        totalAll: { type: GraphQLInt }
    })
})

export {
    PersonInputType,
    PersonType,
    PersonPageType,
    PersonTypeSimplified
};