import { GraphQLNonNull, GraphQLBoolean } from 'graphql';

import ContactsGroup from "../../models/contacts-group.js";
import Person from "../../models/person.js";
import { ContactsGroupInputType, ContactsGroupNonOwnerType } from "./types.js";

const ContactsGroupMutations = {
    createContactsGroup: {
        type: ContactsGroupNonOwnerType,
        args: {
            input: {
                type: new GraphQLNonNull(ContactsGroupInputType)
            }
        },
        resolve: async (_, { input }) => {
            const owner = await (new Person).getByPublicId(input.owner.publicId);
            if(owner) {
                const contactsGroup = new ContactsGroup();
                contactsGroup.owner=owner;
                contactsGroup.description=input.description;
                if(await contactsGroup.insert())
                    return contactsGroup;
            }
            return null;
        }
    },
    deleteContactsGroup: {
        type: GraphQLBoolean,
        args: {
            input: { type: new GraphQLNonNull(ContactsGroupInputType) }
        },
        resolve: async (_, { input }) => {
            const person = await (new Person).getByPublicId(input.owner.publicId);
            if(person) {
                const cgroup = await (new ContactsGroup).getByOwner(person,input.description);
                if(cgroup)
                    return await cgroup.delete();
            }
            return false;
        }
    }
};

export default ContactsGroupMutations;