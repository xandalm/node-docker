import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import ContactsGroupMutations from './contacts_group/mutations.js';
import ContactsGroupQueries from './contacts_group/queries.js';
import PersonMutations from './person/mutations.js';
import PersonQueries from './person/queries.js';

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            ...PersonQueries,
            ...ContactsGroupQueries
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
            ...PersonMutations,
            ...ContactsGroupMutations
        })
    })
})

export default schema;