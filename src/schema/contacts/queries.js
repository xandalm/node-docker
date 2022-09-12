import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';
import Contact from "../../models/contact.js";
import Person from "../../models/person.js";
import Filter from "../../utils/filter.js";
import { PersonInputType } from "../person/types.js";
import { ContactPageType, ContactType } from "./types.js";

const ContactQueries = {
    contacts: {
        type: new GraphQLNonNull(ContactPageType),
        args: {
            first: {
                type: GraphQLInt,
                defaultValue: 10
            },
            last: { type: GraphQLInt },
            filters: {
                type: new GraphQLList(GraphQLString)
            }
        },
        resolve: async (_, { first, last, filters }) => {
            const res = await (new Contact).list(Filter.from(filters).recognizedFilters);
            return {
                count: res.length,
                rows: res
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
            return await (new Contact).get(o,p);
        }
    },
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
            var res = await (new Contact).listByOwner(o,Filter.from(filters).recognizedFilters);
            return {
                count: res.length,
                rows: res
            };
        }
    }
};

export default ContactQueries;