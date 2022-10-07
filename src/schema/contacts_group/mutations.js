import { GraphQLNonNull, GraphQLBoolean, GraphQLString } from 'graphql';
import ContactsGroupController from '../../controllers/contacts-group.js';

import { ContactsGroupInputType, ContactsGroupNonOwnerType, ContactsGroupType } from "./types.js";

const ContactsGroupMutations = {
    createContactsGroup: {
        type: ContactsGroupNonOwnerType,
        args: {
            input: {
                type: new GraphQLNonNull(ContactsGroupInputType)
            }
        },
        resolve: (_, { input }) => ContactsGroupController.createContactsGroup(input)
    },
    updateContactsGroup: {
        type: ContactsGroupType,
        args: {
            input: {
                type: new GraphQLNonNull(ContactsGroupInputType)
            }
        },
        resolve: (_, { input }) => ContactsGroupController.updateContactsGroup(input)
    },
    deleteContactsGroup: {
        type: GraphQLBoolean,
        args: {
            PID: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { PID }) => ContactsGroupController.deleteContactsGroup(PID)
    }
};

export default ContactsGroupMutations;