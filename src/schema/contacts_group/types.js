import { 
    GraphQLObjectType, GraphQLInputObjectType, 
    GraphQLNonNull, GraphQLList, GraphQLString, 
    GraphQLInt
} from 'graphql';

import { PersonTypeSimplified } from '../person/types.js';

const ContactsGroupType = new GraphQLObjectType({
    name: 'ContactsGroup',
    fields: () => ({
        publicId: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.public_id;
            }
        },
        owner: { type: PersonTypeSimplified },
        description: { type: GraphQLString },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment?.toISOString();
            }
        }
    })
});

const ContactsGroupNonOwnerType = new GraphQLObjectType({
    name: 'ContactsGroupNonOwner',
    fields: () => ({
        publicId: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.public_id;
            }
        },
        description: { type: GraphQLString },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment?.toISOString();
            }
        }
    })
});

const ContactsGroupInputType = new GraphQLInputObjectType({
    name: 'ContactsGroupInput',
    fields: () => ({
        publicId: { type: GraphQLString },
        ownerId: { type: GraphQLString },
        description: { type: GraphQLString },
    })
});

const ContactsGroupPageType = new GraphQLObjectType({
    name: 'ContactsGroupPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactsGroupType)) },
        totalInCondition: { type: GraphQLInt },
        totalAll: { type: GraphQLInt }
    })
});

const ContactsGroupNonOwnerPageType = new GraphQLObjectType({
    name: 'ContactsGroupPageNonOwner',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactsGroupNonOwnerType)) },
        totalInCondition: { type: GraphQLInt },
        totalAll: { type: GraphQLInt }
    })
});

export {
    ContactsGroupInputType,
    ContactsGroupType,
    ContactsGroupNonOwnerType,
    ContactsGroupPageType,
    ContactsGroupNonOwnerPageType
};