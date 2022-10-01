import { GraphQLEnumType } from 'graphql';

const SortOrderEnumType = new GraphQLEnumType({
    name: 'Order',
    values: {
        ASC: { value: 'ASC' },
        DESC: { value: 'DESC' }
    }
});

export {
    SortOrderEnumType
};