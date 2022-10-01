import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';
import Contact from "../../models/contact.js";
import Person from "../../models/person.js";
import { Condition } from "../../utils/condition.js";
import { OrderBy } from '../../utils/order.js';
import { PersonInputType } from "../person/types.js";
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
        resolve: async (_, { page, limit, where, orderBy }) => {
            const c = new Contact;
            const condition = Condition.from(where);
            const res = c.list({ page, limit, condition, orderBy: OrderBy.from(orderBy) });
            const totalInCondition = c.count(condition);
            const totalAll = c.count();
            return {
                rows: res,
                totalInCondition,
                totalAll
            };
        }
    },
    contact: {
        type: ContactType,
        args: {
            owner: { type: PersonInputType },
            person: { type: PersonInputType },
        },
        resolve: async (_, { owner, person }) => {
            const o = new Person;
            o.public_id = owner.publicId;
            const p = new Person;
            p.public_id = person.publicId;
            return (new Contact).get(o,p);
        }
    }/* ,
    personContacts: {
        type: new GraphQLNonNull(new GraphQLList(ContactType)),
        args: {
            first: {
                type: GraphQLInt,
                defaultValue: 10
            },
            owner: { type: PersonInputType },
            last: { type: GraphQLInt },
            filters: {
                type: new GraphQLList(GraphQLString)
            }
        },
        resolve: async (_, { first, last, owner, filters }) => {
            const o = new Person;
            o.public_id = owner.publicId;
            var res = await (new Contact).listByOwner(o,Condition.from(filters).recognized);
            return {
                count: res.length,
                rows: res
            };
        }
    } */
};

export default ContactQueries;