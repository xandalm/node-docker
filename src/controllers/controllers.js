import crypto from 'crypto';
import Observer from '../utils/observer.js';

class Controller {

    #observers = new Map();

    registerObserver(observer) {
        if(!observer instanceof Observer)
            throw new TypeError("Expected observer to be Observer type");
        observer.id = observer.id??crypto.randomUUID();
        this.#observers.set(observer.id, observer);
        observer.observing.add(this);
    }

    removeObserver(observer) {
        this.#observers.delete(observer.id);
    }

    notifyObservers(payload) {
        this.#observers.forEach(o => o.update(payload));
    }

}

export default Controller;