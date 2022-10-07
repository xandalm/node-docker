import Controller from '../controllers/controllers.js'
import Person from '../models/person.js';
import { Condition } from '../utils/condition.js';
import { OrderBy } from '../utils/order.js';

class ContactControllerClass extends Controller {

    getContacts({ page, limit, where, orderBy }) {
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

    getUniqueContact(ownerPID, personPID) {
        const o = new Person;
        o.public_id = ownerPID;
        const p = new Person;
        p.public_id = personPID;
        return (new Contact).get(o,p);
    }

    async createContact({ ownerPID, personPID }) {
        const owner = (new Person).getByPublicId(ownerPID);
        if(owner) {
            const person = (new Person).getByPublicId(personPID);
            if(person) {
                var ctt = (new Contact).get(owner,person);
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

    deleteContact(ownerPID, personPID) {
        const owner = (new Person).getByPublicId(ownerPID);
        if(owner) {
            const person = (new Person).getByPublicId(personPID);
            if(person) {
                const ctt = (new Contact).get(owner,person);
                if(ctt && ctt.deleted_moment==null) {
                    return ctt.delete();
                }
            }
        }
        return false;
    }

}

const ContactController = new ContactControllerClass;

export default ContactController;
