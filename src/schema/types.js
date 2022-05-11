import { GraphQLInputObjectType, GraphQLString } from 'graphql';
import { SortOrderEnumType } from './enums.js';

const OrderByInputType = new GraphQLInputObjectType({
    name: 'OrderBy',
    fields: () => ({
        fieldName: { type: GraphQLString },
        sortOrder: { type: SortOrderEnumType }
    })
});

export {
    OrderByInputType
}