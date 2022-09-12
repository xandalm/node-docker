import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import Contact from "../../models/contact.js";
import Person from "../../models/person.js";
import { ContactInputType, ContactNonOwnerType } from "./types.js";

const ContactMutations = {
    createContact: {
        type: ContactNonOwnerType,
        args: {
            input: { type: new GraphQLNonNull(ContactInputType) }
        },
        resolve: async (_, { input }) => {
            const owner = (typeof input.owner === 'string')?
                await (new Person).getByPublicId(input.owner):
                await (new Person).getByPublicId(input.owner.publicId);
            if(owner) {
                const person = await (typeof input.person === 'string')?
                    await (new Person).getByPublicId(input.person):
                    await (new Person).getByPublicId(input.person.publicId);
                if(person) {
                    var ctt = await (new Contact).get(owner,person);
                    if(!ctt) {
                        ctt = new Contact;
                        ctt.owner = owner;
                        ctt.person = person;
                        return await ctt.insert();
                    }
                    if(ctt.deleted_moment!=null)
                        return await ctt.insert();
                }
            }
            return null;
        }
    },
    deleteContact: {
        type: GraphQLBoolean,
        args: {
            input: { type: new GraphQLNonNull(ContactInputType) }
        },
        resolve: async (_, { input }) => {
            const owner = await (new Person).getByPublicId(input.owner.publicId);
            if(owner) {
                const person = await (new Person).getByPublicId(input.person.publicId);
                if(person) {
                    var ctt = await (new Contact).get(owner,person);
                    if(ctt && ctt.deleted_moment==null) {
                        return await ctt.delete();
                    }
                }
            }
            return false;
        }
    }
};

export default ContactMutations;
