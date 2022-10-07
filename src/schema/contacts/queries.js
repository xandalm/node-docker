import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';
import ContactController from '../../controllers/contact.js';
import { OrderByInputType, QueryConditionInputType } from '../types.js';
import { ContactPageType, ContactType } from "./types.js";

const ContactQueries = {
    contacts: {
        type: new GraphQLNonNull(ContactPageType),
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: QueryConditionInputType },
            orderBy: { type: OrderByInputType }
        },
        resolve: (_, { page, limit, where, orderBy }) => ContactController.getContacts({ page, limit, where, orderBy })
    },
    contact: {
        type: ContactType,
        args: {
            ownerPID: { type: new GraphQLNonNull(GraphQLString) },
            personPID: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_, { ownerPID, personPID }) => ContactController.getUniqueContact(ownerPID, personPID)
    }

};

export default ContactQueries;