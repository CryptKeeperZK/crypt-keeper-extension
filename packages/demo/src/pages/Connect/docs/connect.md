# 🔌 Connect to CryptKeeper

To establish a connection with the CryptKeeper extension, follow the steps outlined below.
This process will prompt the user with a screen displaying a list of identities. The user can then select their preferred identity to establish the connection.

# 📋 Steps to Connect:

## 1. Initiate Connection

- **Description**: Begin the connection process by initializing CryptKeeper.
- **Action**: This would initialize a CryptKeeper client of `ICryptKeeperInjectedProvider` interface.

```ts
// 1
```

## 2. Connection Request

- **Description**: Start the connection with CryptKeeper by requesting a connection request via `client.connect()`
- **Screen Display**:
  - A locker screen will be displayed to unlock the extension.![Locker screen](./screenshots/lock.png "Locker screen")
  - An approval screen will be shown to ask the user to approve the connection and also if the user wants to grant the ability for that host to generate proofs directly without asking for another approvals. ![Approval screen](./screenshots/approve.png "Approval screen")
  - A connection screen will be shown with the list of identities the user has to choose from. ![Connection screen](./screenshots/connect.png "Connection screen")
  - The user has an option to create a new identity while doing this connection step. ![Create new identity screen](./screenshots/create.png "Create new identity screen")
  - Finally, the user can check an identity from the list for doing the connection.![Check screen](./screenshots/check-connect.png "Check screen")
- **Action**: This action would send a connection request to the CryptKeeper.

```ts
// 2
```

## 3. Listen to `CONNECT` Event

- **Description**: Application needs to listen to `EventNames.CONNECT` to get the connected identity.
- **Action**: CryptKeeper will fire an `EventNames.CONNECT` once the user finished with the connection request.

```ts
// 3
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
