# 🔌 Connect to extension

## Connect to extension

Use `zkpr.connect` to access the extension.

Initialize the `zkpr.connect` function, which returns a promise that resolves to the client object.

&#x20;Once you have the client object, you can use it to make RPC calls to the extension.

&#x20;[@src/contentscripts/injected.ts](https://github.com/privacy-scaling-explorations/crypt-keeper-extension/blob/master/src/contentscripts/injected.ts)

```typescript
async function connect() {
    let result
    try {
        const approved = await tryInject(window.location.origin)

        if (approved) {
            await addHost(window.location.origin)
            result = client
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Err: ', err)
        result = null
    }

    await post({ method: RPCAction.CLOSE_POPUP })

    return result
}

declare global {
    interface Window {
        zkpr: {
            connect: () => any
        }
    }
}// Some code
```
