import { GraphQLNonNull, GraphQLBoolean } from 'graphql';

import ContactsGroup from "../../models/contacts-group.js";
import Person from "../../models/person.js";
import { ContactsGroupInputType, ContactsGroupNonOwnerType, ContactsGroupType } from "./types.js";

const ContactsGroupMutations = {
    createContactsGroup: {
        type: ContactsGroupNonOwnerType,
        args: {
            input: {
                type: new GraphQLNonNull(ContactsGroupInputType)
            }
        },
        resolve: async (_, { input }) => {
            const owner = (new Person).getByPublicId(input.ownerId);
            if(owner) {
                const cgroup = new ContactsGroup();
                cgroup.owner=owner;
                cgroup.description=input.description;
                if(cgroup.insert())
                    return cgroup;
            }
            return null;
        }
    },
    updateContactsGroup: {
        type: ContactsGroupType,
        args: {
            input: {
                type: new GraphQLNonNull(ContactsGroupInputType)
            }
        },
        resolve: async (_, { input }) => {
            const cgroup = (new ContactsGroup).getByPublicId(input.publicId);
            if(cgroup) {
                const prevDesc = cgroup.description;
                cgroup.description = input.description;
                if(!await cgroup.update())
                    cgroup.description = prevDesc;
                return cgroup;
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
            const cgroup = (new ContactsGroup).getByPublicId(input.publicId);
            if(cgroup) {
                return cgroup.delete();
            }
            return false;
        }
    }
};

export default ContactsGroupMutations;