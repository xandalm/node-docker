import { GraphQLInputObjectType, GraphQLUnionType, GraphQLList, GraphQLInterfaceType, GraphQLInt, GraphQLString } from 'graphql';
import { SortOrderEnumType } from './enums.js';

const OrderByInputType = new GraphQLInputObjectType({
    name: 'OrderBy',
    fields: () => ({
        field: { type: GraphQLString },
        order: {
            type: SortOrderEnumType,
            defaultValue: SortOrderEnumType.getValue('ASC')
        }
    })
});

const QueryConditionInputType = new GraphQLInputObjectType({
    name: 'QueryConditionInput',
    fields: () => ({
        operator: { type: GraphQLString },
        grouping: { type: new GraphQLList(QueryConditionInputType) },
        condition: { type: GraphQLString }
    })
})

export {
    OrderByInputType,
    QueryConditionInputType
}