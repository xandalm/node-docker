import { 
    GraphQLObjectType, GraphQLInputObjectType, 
    GraphQLNonNull, GraphQLList, GraphQLString, 
    GraphQLInt, GraphQLBoolean 
} from 'graphql';

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

const PersonType = new GraphQLObjectType({
    name: 'Person',
    fields: () => ({
        publicId: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.public_id??null;
            }
        },
        name: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.first_name + ' ' + obj.last_name;
            }
        },
        firstName: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.first_name??null;
            }
        },
        lastName: {
            type: GraphQLString,
            resolve: (obj) => {
                return obj.last_name??null;
            }
        },
        birthday: { 
            type: GraphQLString,
            resolve: (obj) => {
                return obj.birthday.toISOString();
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
        },
    })
});

const PersonPageType = new GraphQLObjectType({
    name: 'PersonsPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(PersonType)) },
        count: { type: GraphQLInt },
        order: { type: GraphQLString }
    })
})

export {
    PersonInputType,
    PersonType,
    PersonPageType
};