# 🔌 Reveal Identity Commitment

> **Tip**: Always ensure to check if the client is initialized before making a request to avoid potential errors.

Revealing identity commitment in the CryptKeeper extension can be accomplished through a straightforward process. Below are the detailed steps to guide you in revealing the identity commitment successfully.

# 📋 Steps to Reveal Identity Commitment:

## 1. Send Request to Reveal Identity Commitment

- **Description**: Send a request to the CryptKeeper to reveal the connected identity commitment using `client?.request()` by calling `RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT`.
- **Screen Display:**:
  - Upon sending the request, a reveal screen might be displayed showcasing the revealed identity commitment details.![Reveal Identity Commitment Approval screen](./screenshots/reveal.png "Reveal Identity Commitment Approval screen")
- **Action**: This action sends a request to the CryptKeeper to import the identity with the given parameters.

```ts
// 1
```

## 2. Listen to `REVEAL_COMMITMENT` Event

- **Description**: The application should listen to `EventNames.REVEAL_CONNECTED_IDENTITY_COMMITMENT` to receive feedback or a response regarding the reveal request.
- **Action**: CryptKeeper will trigger the `EventNames.REVEAL_CONNECTED_IDENTITY_COMMITMENT` event after the reveal request is processed.

```ts
// 2
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
