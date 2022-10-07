import { WebSocketServer } from 'ws';

export default class SimpleWSServer {
	constructor({ server, path }) {
		this._server = new WebSocketServer({
			server,
			path
		});
		const interval = setInterval(function ping(wss) {
			wss.clients.forEach(function each(ws) {
				if (ws.isAlive === false)
					return ws.terminate();
				ws.isAlive = false;
				ws.ping();
			  });
		}, 6e4/* 60 seconds */, this._server);
		this._server.on("close", function close() {
			clearInterval(interval);
		})
	}

	_parseMessage(data, isBinary) {
		var message = isBinary ? data: data.toString();
		try {
			message = JSON.parse(message);
		} catch(err) {
			ws.close(1003, "Wrong border to watch");
		}
		return message;
	}

	on(eventName, listener) {
		switch (eventName) {
			case "connection": 
				this._server.on("connection", ws => {
					listener(ws);
					ws.on("pong", function() { this.isAlive = true; })
					ws.on("message", (data, isBinary) => {
						var message = this._parseMessage(data, isBinary);
						switch(message.type) {
							case "contacts:watch":
							case "contacts:stop":
							case "persons:watch":
							case "persons:stop":
							case "contacts-groups:watch":
							case "contacts-groups:stop":
								ws.emit(message.type);
							break;
							default: 
								ws.close(1003, "Wrong border to watch");
						}
					});
					ws.once("error", err => {
						console.error("Internal error emitted by WebSocket socket", err);
						ws.close(1011, "Internal server error");
					})
				});
		}
	}
}
