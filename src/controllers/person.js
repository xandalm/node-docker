import Controller from '../controllers/controllers.js'
import Person from '../models/person.js';
import { Condition } from '../utils/condition.js';
import { OrderBy } from '../utils/order.js';

class PersonControllerClass extends Controller {

    getPersons({ page, limit, where, orderBy }) {
        const person = new Person;
        const condition = Condition.from(where);
        const res = person.list({ page, limit, condition, orderBy: OrderBy.from(orderBy) });
        const totalInCondition = person.count(condition);
        const totalAll = person.count();
        return {
            rows: res,
            totalInCondition,
            totalAll
        };
    }

    getUniquePerson(PID) {
        const person = (new Person).getByPublicId(PID);
        return person;
    }

    createPerson({ firstName, lastName, birthday, email }) {
        const person = new Person;
        person.first_name=firstName;
        person.last_name=lastName;
        person.birthday=birthday;
        person.email=email;
        if(person.insert()) {
            this.notifyObservers({  });
            return person;
        }
        return null;
    }

    updatePerson({ PID, firstName, lastName, birthday, email }) {
        const person = (new Person).getByPublicId(PID);
        if(person) {
            person.first_name=firstName;
            person.last_name=lastName;
            person.birthday=birthday;
            person.email=email;
            if(person.update()) 
                return person;
        }
        return null;
    }

    deletePerson(PID) {
        const person = (new Person).getByPublicId(PID);
        if(person)
            return person.delete();
        return false;
    }

}

const PersonController = new PersonControllerClass;

export default PersonController;
