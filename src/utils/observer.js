import WebSocket from 'ws';

export default class Observer {

    constructor(socket) {
        if(!socket instanceof WebSocket)
            throw new TypeError("Expected socket to be WebSocket type");
        this.observing = new Set();
        this.socket = socket;
        ((o) => {
            socket.once('close', () => {
                o.interrupt();
            });
        })(this);
    }

    update(payload={}) {
        this.socket.send(JSON.stringify(payload));
    }

    interrupt() {
        this.observing.forEach(s => s.removeObserver(this));
    }
}