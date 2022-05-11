import { 
    GraphQLObjectType, GraphQLInputObjectType, 
    GraphQLNonNull, GraphQLList, GraphQLString, 
    GraphQLInt
} from 'graphql';

import { PersonInputType, PersonType } from '../person/types.js';

const ContactsGroupType = new GraphQLObjectType({
    name: 'ContactsGroup',
    fields: () => ({
        owner: { type: PersonType },
        description: { type: GraphQLString },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment.toISOString();
            }
        }
    })
});

const ContactsGroupNonOwnerType = new GraphQLObjectType({
    name: 'ContactsGroupNonOwner',
    fields: () => ({
        description: { type: GraphQLString },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment.toISOString();
            }
        }
    })
});

const ContactsGroupInputType = new GraphQLInputObjectType({
    name: 'ContactsGroupInput',
    fields: () => ({
        owner: { type: PersonInputType },
        description: { type: GraphQLString },
    })
});

const ContactsGroupPageType = new GraphQLObjectType({
    name: 'ContactsGroupPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactsGroupType)) },
        count: { type: GraphQLInt },
    })
});

const ContactsGroupNonOwnerPageType = new GraphQLObjectType({
    name: 'ContactsGroupPageNonOwner',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactsGroupNonOwnerType)) },
        count: { type: GraphQLInt },
    })
});

export {
    ContactsGroupInputType,
    ContactsGroupType,
    ContactsGroupNonOwnerType,
    ContactsGroupPageType,
    ContactsGroupNonOwnerPageType
};