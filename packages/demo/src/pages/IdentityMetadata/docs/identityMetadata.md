# 🔌 Get Connected Identity Metadata

> **Tip**: Always ensure to check if the client is initialized before making a request to avoid potential errors.

To retrieve the metadata of the connected identity with the CryptKeeper extension, follow the steps outlined below.
This process enables the application to fetch details of the currently connected identity without re-establishing a new connection.

# 📋 Steps to Get Connected Identity:

## 1. Initialize CryptKeeper Client

- **Description**: Before fetching the identity metadata, ensure the CryptKeeper client is initialized. Check Connection part.

## 2. Request Connected Identity Metadata

- **Description**: Retrieve the metadata of the connected identity by sending a request via `client?.request()` via calling `RPCExternalAction.GET_CONNECTED_IDENTITY_DATA`.
- **Action**: This action would send a request to the CryptKeeper to fetch the metadata of the connected identity.

```ts
// 1
```

## 3. Use the Retrieved Metadata

- **Description**: After retrieving the metadata, you can utilize the returned `ConnectedIdentityMetadata` object in your application.

```ts
interface ConnectedIdentityMetadata {
  name: string;
  urlOrigin: string;
}
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
