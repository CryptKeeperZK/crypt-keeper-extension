import * as React from 'react'
import ReactDOM from "react-dom/client";
import { browser, Runtime } from 'webextension-polyfill-ts'
import Popup from '@src/ui/pages/Popup'
import { Provider } from 'react-redux'
import { store } from '@src/ui/store/configureAppStore'
import { HashRouter } from 'react-router-dom'
import { isManifestV3 } from '@src/background/shared/checkManifestV3';
import log from 'loglevel';

globalThis.CRYPTKEEPER_UI_DEBUG = false;

log.setDefaultLevel(globalThis.CRYPTKEEPER_UI_DEBUG ? 'debug' : 'info');

/*
 * @src MetaMask Extension workaround
 * As long as UI is open it will keep sending messages to service worker
 * In service worker as this message is received
 * if service worker is inactive it is reactivated and script re-loaded
 * Time has been kept to 1000ms but can be reduced for even faster re-activation of service worker
 */
let extensionPort: Runtime.Port;

// let lastMessageReceivedTimestamp = Date.now();

// let ackTimeoutToDisplayError;

// // Service Worker Keep Alive Message Constants
// const ONE_SECOND_IN_MILLISECONDS = 1_000;
// const WORKER_KEEP_ALIVE_INTERVAL = ONE_SECOND_IN_MILLISECONDS;
// const WORKER_KEEP_ALIVE_MESSAGE = 'WORKER_KEEP_ALIVE_MESSAGE 2';
// const ACK_KEEP_ALIVE_WAIT_TIME = 60_000; // 1 minute
// const ACK_KEEP_ALIVE_MESSAGE = 'ACK_KEEP_ALIVE_MESSAGE';


browser.runtime.onMessage.addListener((action) => {
    if (action?.type) {
        store.dispatch(action)
    }
});

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    extensionPort = browser.runtime.connect();
    
    // if (isManifestV3) {
    //     // Checking for SW aliveness (or stuckness) flow
    //     // 1. Check if we have an extensionPort, if yes
    //     // 2a. Send a keep alive message to the background via extensionPort
    //     // 2b. Add a listener to it (if not already added)
    //     // 3a. Set a timeout to check if we have received an ACK from background
    //     // 3b. If we have not received an ACK within ACK_KEEP_ALIVE_WAIT_TIME,
    //     //     we know the background is stuck or dead
    //     // 4. If we recieve an ACK_KEEP_ALIVE_MESSAGE from the service worker, we know it is alive
      
    //     const ackKeepAliveListener = (message: any) => {
    //       if (message.name === ACK_KEEP_ALIVE_MESSAGE) {
    //           lastMessageReceivedTimestamp = Date.now();
    //           clearTimeout(ackTimeoutToDisplayError);
    //       }
    //     }
      
    //     const keepAliveInterval = setInterval(() => {
    //       browser.runtime.sendMessage({ name: WORKER_KEEP_ALIVE_MESSAGE });
      
    //       if (extensionPort) {
    //           extensionPort.postMessage({ name: WORKER_KEEP_ALIVE_MESSAGE });
      
    //           if (extensionPort.onMessage.hasListener(ackKeepAliveListener) === false) {
    //               extensionPort.onMessage.addListener(ackKeepAliveListener);
    //           }
    //       } 
      
    //       ackTimeoutToDisplayError = setTimeout(() => {
    //           if (Date.now() - lastMessageReceivedTimestamp > ACK_KEEP_ALIVE_WAIT_TIME) {
    //               clearInterval(keepAliveInterval);
    //               throw new Error("Something has gone wrong. Try reloading the page");
    //           }
    //       }, ACK_KEEP_ALIVE_WAIT_TIME)
    //     }, WORKER_KEEP_ALIVE_INTERVAL);
    // }

    const root = ReactDOM.createRoot(document.getElementById("popup") as HTMLElement);
    root.render(
        <Provider store={store}>
            <HashRouter>
                <Popup />        
            </HashRouter>
        </Provider>
    );
    log.debug('CryptKeeper UI initialization complete.');
});
