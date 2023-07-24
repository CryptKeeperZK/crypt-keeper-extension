import { getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform } from "@src/constants";

// eslint-disable
// A workaround for resolving `Worker is not defined` error with MV3 on Chromium based platforms.
(async function () {
  const browserPlatform = getBrowserPlatform();

  if (browserPlatform === BrowserPlatform.Firefox) {
    return;
  }

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
        const that = this;
        this.id = Math.random().toString(36).substr(2, 5);

        this.eventListeners = {
          message: [],
        };
        self.addEventListener("message", (e) => {
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
        const slashedPath = path.charAt(0) == "/" ? path : `/${path}`;
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
        postMessage(message, transfer) {
          self.postMessage(
            {
              _subworker: true,
              id: this.id,
              cmd: "passMessage",
              message,
              transfer,
            },
            transfer,
          );
        },
        terminate() {
          self.postMessage({
            _subworker: true,
            cmd: "terminate",
            id: this.id,
          });
        },
        addEventListener(type, listener, useCapture) {
          if (this.eventListeners[type]) {
            this.eventListeners[type].push(listener);
          }
        },
        removeEventListener(type, listener, useCapture) {
          if (!(type in this.eventListeners)) {
            return;
          }
          const index = this.eventListeners[type].indexOf(listener);
          if (index !== -1) {
            this.eventListeners[type].splice(index, 1);
          }
        },
        dispatchEvent(event) {
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
    newWorker(event) {
      const worker = new Worker(event.data.path);
      worker.addEventListener("message", (e) => {
        const envelope = {
          _from: event.data.id,
          message: e.data,
        };
        event.target.postMessage(envelope);
      });
      allWorkers[event.data.id] = worker;
    },
    terminate(event) {
      allWorkers[event.data.id].terminate();
    },
    passMessage(event) {
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
// eslint-enable
