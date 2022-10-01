import { GraphQLNonNull, GraphQLInt } from 'graphql';

import { ContactsGroupPageType } from './types.js';
import ContactsGroup from '../../models/contacts-group.js';
import { Condition } from '../../utils/condition.js';
import { OrderByInputType, QueryConditionInputType } from '../types.js';
import { OrderBy } from '../../utils/order.js';

const ContactsGroupQueries = {
    contactsGroups: {
        type: new GraphQLNonNull(ContactsGroupPageType),
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: QueryConditionInputType },
            orderBy: { type: OrderByInputType }
        },
        resolve: async (_, { page, limit, where, orderBy }) => {
            const cg = new ContactsGroup;
            const condition = Condition.from(where);
            const res = cg.list({ page, limit, condition, orderBy: OrderBy.from(orderBy) });
            const totalInCondition = cg.count(condition);
            const totalAll = cg.count();
            return {
                rows: res,
                totalInCondition,
                totalAll
            };
        }
    }
};

export default ContactsGroupQueries;