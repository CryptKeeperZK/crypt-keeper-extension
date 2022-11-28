import * as React from 'react'
//import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom/client";
import { browser } from 'webextension-polyfill-ts'
import Popup from '@src/ui/pages/Popup'
import { Provider } from 'react-redux'
import { store } from '@src/ui/store/configureAppStore'
import { HashRouter } from 'react-router-dom'

chrome.tabs.query({ active: true, currentWindow: true }).then(() => {
    const port = chrome.runtime.connect({name: "New connection"});

    port.onMessage.addListener((action) => {
        if (action?.type) {
            store.dispatch(action)
        }
    });
    
    const root = ReactDOM.createRoot(document.getElementById("popup") as HTMLElement);
    root.render(
        <Provider store={store}>
            <HashRouter>
                <Popup />
            </HashRouter>
        </Provider>
    );

    // ReactDOM.render(
    //     <Provider store={store}>
    //         <HashRouter>
    //             <Popup />
    //         </HashRouter>
    //     </Provider>,
    //     document.getElementById('popup')
    // )
})
