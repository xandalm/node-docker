import { GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLList, GraphQLString, GraphQLInt } from 'graphql';
import { PersonInputType, PersonTypeSimplified } from '../person/types.js';

const ContactInputType = new GraphQLInputObjectType({
    name: 'ContactInput',
    description: '',
    fields: () => ({
        ownerId: { type: GraphQLString },
        personId: { type: GraphQLString }
    })
});

const ContactType = new GraphQLObjectType({
    name: 'Contact',
    description: '',
    fields: () => ({
        owner: { type: PersonTypeSimplified },
        person: { type: PersonTypeSimplified },
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
        }
    })
});

const ContactNonOwnerType = new GraphQLObjectType({
    name: 'ContactNonOwner',
    description: '',
    fields: () => ({
        person: { type: PersonTypeSimplified },
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
        }
    })
})

const ContactPageType = new GraphQLObjectType({
    name: 'ContactPage',
    description: '',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactType)) },
        totalInCondition: { type: GraphQLInt },
        totalAll: { type: GraphQLInt }
    })
})

const ContactPageNonOwnerType = new GraphQLObjectType({
    name: 'ContactPageNonOwner',
    description: '',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactNonOwnerType)) },
        totalInCondition: { type: GraphQLInt },
        totalAll: { type: GraphQLInt }
    })
})

export {
    ContactInputType,
    ContactType,
    ContactNonOwnerType,
    ContactPageNonOwnerType,
    ContactPageType
};