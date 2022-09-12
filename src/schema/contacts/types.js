import { GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLList, GraphQLString, GraphQLInt } from 'graphql';
import { PersonInputType, PersonType } from '../person/types.js';

const ContactInputType = new GraphQLInputObjectType({
    name: 'ContactInput',
    description: '',
    fields: () => ({
        owner: { type: PersonInputType },
        person: { type: PersonInputType }
    })
});

const ContactType = new GraphQLObjectType({
    name: 'Contact',
    description: '',
    fields: () => ({
        owner: { type: PersonType },
        person: { type: PersonType },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment?obj.created_moment.toISOString():null;
            }
        },
        deletedMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.deleted_moment?obj.deleted_moment.toISOString():null;
            }
        }
    })
});

const ContactNonOwnerType = new GraphQLObjectType({
    name: 'ContactNonOwner',
    description: '',
    fields: () => ({
        person: { type: PersonType },
        createdMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.created_moment?obj.created_moment.toISOString():null;
            }
        },
        deletedMoment: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.deleted_moment?obj.deleted_moment.toISOString():null;
            }
        }
    })
})

const ContactPageType = new GraphQLObjectType({
    name: 'ContactPage',
    description: '',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactType)) },
        count: { type: GraphQLInt }
    })
})

const ContactPageNonOwnerType = new GraphQLObjectType({
    name: 'ContactPageNonOwner',
    description: '',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(ContactNonOwnerType)) },
        count: { type: GraphQLInt }
    })
})

export {
    ContactInputType,
    ContactType,
    ContactNonOwnerType,
    ContactPageNonOwnerType,
    ContactPageType
};