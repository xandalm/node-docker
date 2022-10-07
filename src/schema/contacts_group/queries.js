import { GraphQLNonNull, GraphQLInt } from 'graphql';

import { ContactsGroupPageType } from './types.js';
import { OrderByInputType, QueryConditionInputType } from '../types.js';
import ContactsGroupController from '../../controllers/contacts-group.js';

const ContactsGroupQueries = {
    contactsGroups: {
        type: new GraphQLNonNull(ContactsGroupPageType),
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: QueryConditionInputType },
            orderBy: { type: OrderByInputType }
        },
        resolve: (_, { page, limit, where, orderBy }) => ContactsGroupController.getContactsGroups({ page, limit, where, orderBy })
    }
};

export default ContactsGroupQueries;