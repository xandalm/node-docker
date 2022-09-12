import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import ContactMutations from './contacts/mutations.js';
import ContactQueries from './contacts/queries.js';
import ContactsGroupMutations from './contacts_group/mutations.js';
import ContactsGroupQueries from './contacts_group/queries.js';
import PersonMutations from './person/mutations.js';
import PersonQueries from './person/queries.js';

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            ...PersonQueries,
            ...ContactQueries,
            ...ContactsGroupQueries
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
            ...PersonMutations,
            ...ContactMutations,
            ...ContactsGroupMutations
        })
    })
})

export default schema;