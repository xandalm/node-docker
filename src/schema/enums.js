import { GraphQLEnumType } from 'graphql';

const SortOrderEnumType = new GraphQLEnumType({
    name: 'Order',
    values: {
        ASC: { },
        DESC: { }
    }
});

export {
    SortOrderEnumType
};