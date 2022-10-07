import Controller from '../controllers/controllers.js'
import ContactsGroup from '../models/contacts-group.js';
import Person from '../models/person.js';
import { Condition } from '../utils/condition.js';
import { OrderBy } from '../utils/order.js';

class ContactsGroupControllerClass extends Controller {

    getContactsGroups({ page, limit, where, orderBy }) {
        const cg = new ContactsGroup;
        const condition = Condition.from(where);
        const res = cg.list({ page, limit, condition, orderBy: OrderBy.from(orderBy) });
        const totalInCondition = cg.count(condition);
        const totalAll = cg.count();
        this.notifyObservers();
        return {
            rows: res,
            totalInCondition,
            totalAll
        };
    }

    async createContactsGroup({ ownerPID, description }) {
        const owner = await (new Person).getByPublicId(ownerPID);
        if(owner) {
            const cgroup = new ContactsGroup();
            cgroup.owner=owner;
            cgroup.description=description;
            if(cgroup.insert()) {
                this.notifyObservers({ type: "contacts-groups:update", event: "insert", data: cgroup });
                return cgroup;
            }
        }
        return null;
    }

    async updateContactsGroup({ PID, description }) {
        const cgroup = await (new ContactsGroup).getByPublicId(PID);
        if(cgroup) {
            const prevDesc = cgroup.description;
            cgroup.description = description;
            if(cgroup.update())
                this.notifyObservers();
            else
                cgroup.description = prevDesc;
            return cgroup;
        }
        return null;
    }

    deleteContactsGroup(PID) {
        const cgroup = (new ContactsGroup).getByPublicId(PID);
        if(cgroup) {
            this.notifyObservers({  });
            return cgroup.delete();
        }
        return false;
    }

}

const ContactsGroupController = new ContactsGroupControllerClass;

export default ContactsGroupController;
