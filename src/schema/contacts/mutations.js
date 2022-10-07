import { GraphQLNonNull, GraphQLBoolean, GraphQLString } from 'graphql';
import ContactController from '../../controllers/contact.js';
import { ContactInputType, ContactNonOwnerType } from "./types.js";

const ContactMutations = {
    createContact: {
        type: ContactNonOwnerType,
        args: {
            input: { type: new GraphQLNonNull(ContactInputType) }
        },
        resolve: (_, { input }) => ContactController.createContact(input)
    },
    deleteContact: {
        type: GraphQLBoolean,
        args: {
            ownerPID: { type: new GraphQLNonNull(GraphQLString) },
            personPID: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { ownerPID, personPID }) => ContactController.deleteContact(ownerPID, personPID)
    }
};

export default ContactMutations;
