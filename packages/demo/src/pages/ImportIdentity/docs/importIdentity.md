# 🔌 Import Identity with CryptKeeper

> **Tip**: Always ensure to check if the client is initialized before making a request to avoid potential errors.

The process allows for importing an identity into the CryptKeeper extension using specific parameters like `trapdoor` and `nullifier`. Follow the steps outlined below to ensure a successful import of the identity.

# 📋 Steps to Import Identity:

## 1. Set Up Identity Import Parameters

- **Description**: Prepare the parameters required for importing an identity. This includes the `trapdoor` and `nullifier` values.

```ts
interface IImportIdentityParams {
  trapdoor: string;
  nullifier: string;
}
```

## 2. Import the Identity Request

- **Description**: Import a new Semaphore identity to CryptKeeper by sending a request via `client?.request()` via calling `RPCExternalAction.IMPORT_IDENTITY`.
- **Screen Display**:
  - A import screen will be displayed to add the imported values.![Import screen](./screenshots/import.png "Import screen")
- **Action**: This action sends a request to the CryptKeeper to import the identity with the given parameters.

```ts
// 1
```

## 3. Listen to `IMPORT_IDENTITY` Event

- **Description**: Application can to listen to `EventNames.IMPORT_IDENTITY` to get notified by this action response.
- **Action**: CryptKeeper will fire an `EventNames.IMPORT_IDENTITY` once the user finished with the import request.

```ts
// 2
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
