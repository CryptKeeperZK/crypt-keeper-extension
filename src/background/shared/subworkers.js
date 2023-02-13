// TODO: debug

(function () {
  /* Detect if we're in a worker or not */
  let isWorker = false;
  try {
    document;
  } catch (e) {
    isWorker = true;
  }

  if (isWorker) {
    if (!self.Worker) {
      self.Worker = function (path) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.id = Math.random().toString(36).substr(2, 5);

        this.eventListeners = {
          message: [],
        };
        self.addEventListener("message", function (e) {
          if (e.data._from === that.id) {
            const newEvent = new MessageEvent("message");
            newEvent.initMessageEvent("message", false, false, e.data.message, that, "", null, []);
            that.dispatchEvent(newEvent);
            if (that.onmessage) {
              that.onmessage(newEvent);
            }
          }
        });

        const location = self.location.pathname;
        const slashedPath = path.charAt(0) == "/" ? path : "/" + path;
        const absPath = location.substring(0, location.lastIndexOf("/")) + slashedPath;
        self.postMessage({
          _subworker: true,
          cmd: "newWorker",
          id: this.id,
          path: absPath,
        });
      };
      Worker.prototype = {
        onerror: null,
        onmessage: null,
        postMessage: function (message, transfer) {
          self.postMessage(
            {
              _subworker: true,
              id: this.id,
              cmd: "passMessage",
              message: message,
              transfer: transfer,
            },
            transfer,
          );
        },
        terminate: function () {
          self.postMessage({
            _subworker: true,
            cmd: "terminate",
            id: this.id,
          });
        },
        addEventListener: function (type, listener) {
          if (this.eventListeners[type]) {
            this.eventListeners[type].push(listener);
          }
        },
        removeEventListener: function (type, listener) {
          if (!(type in this.eventListeners)) {
            return;
          }
          const index = this.eventListeners[type].indexOf(listener);
          if (index !== -1) {
            this.eventListeners[type].splice(index, 1);
          }
        },
        dispatchEvent: function (event) {
          const listeners = this.eventListeners[event.type];
          for (let i = 0; i < listeners.length; i++) {
            listeners[i](event);
          }
        },
      };
    }
  }

  const allWorkers = {};
  const cmds = {
    newWorker: function (event) {
      const worker = new Worker(event.data.path);
      worker.addEventListener("message", function (e) {
        const envelope = {
          _from: event.data.id,
          message: e.data,
        };
        event.target.postMessage(envelope);
      });
      allWorkers[event.data.id] = worker;
    },
    terminate: function (event) {
      allWorkers[event.data.id].terminate();
    },
    passMessage: function (event) {
      allWorkers[event.data.id].postMessage(event.data.message, event.data.transfer);
    },
  };
  const messageRecieved = function (event) {
    if (event.data._subworker) {
      cmds[event.data.cmd](event);
    }
  };

  /* Hijack Worker */
  const oldWorker = Worker;
  Worker = function (path) {
    if (this.constructor !== Worker) {
      throw new TypeError(
        "Failed to construct 'Worker': Please use the 'new' operator, this DOM object constructor cannot be called as a function.",
      );
    }

    const blobIndex = path.indexOf("blob:");

    if (blobIndex !== -1 && blobIndex !== 0) {
      path = path.substring(blobIndex);
    }

    const newWorker = new oldWorker(path);
    newWorker.addEventListener("message", messageRecieved);

    return newWorker;
  };
})();
