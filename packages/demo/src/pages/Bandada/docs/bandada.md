# 🔌 External Integration with Bandada System

> **Tip**: Always ensure to check if the client is initialized before making a request to avoid potential errors.

Bandada provides a comprehensive solution for group management, allowing the creation of either manual groups (via direct ID or invite links) or credential groups (which require members to prove specific credentials). Integrating CryptKeeper's extension with Bandada enables developers to:

# Join Group:

# 📋 Steps to Join a Group:

## 1. Set Up Group Joining Parameters

- **Description**: Prepare the parameters required for joining a group. This includes the `groupId`, (`apiKey`, or `inviteCode`).

```ts
interface IJoinGroupParams {
  groupId: string;
  apiKey?: string;
  inviteCode?: string;
}
```

## 2. Join a Group Request

- **Description**: Join a group through the CryptKeeper by sending a request via `client?.request()` via calling `RPCExternalAction.JOIN_GROUP`.
- **Screen Display**:
  - A group joining screen will be displayed prompting the user to enter the necessary details.![Bandada Join Group screen](./screenshots/bandada-join.png "Bandada Join Group screen")
- **Action**: This action sends a request to the CryptKeeper service to join the group with the provided parameters.

```ts
// 1
```

## 3. Listen to `JOIN_GROUP` Event

- **Description**: Application can to listen to `EventNames.JOIN_GROUP` to get notified by this action response.
- **Action**: CryptKeeper will fire an `EventNames.JOIN_GROUP` once the user has successfully joined the group.

```ts
// 2
```

# Generate Group Merkle Proof:

# 📋 Steps to Generate Group Merkle Proof:

## 1. Set Up Group Merkle Proof Parameters

- **Description**: Prepare the parameters required for generating a Group Merkle Proof. The primary parameter here is the `groupId`.

```ts
interface IGenerateGroupMerkleProofParams {
  groupId: string;
}
```

## 2. Generate Group Merkle Proof Request

- **Description**: Generate a Group Merkle Proof with CryptKeeper by sending a request via `client?.request()` via calling `RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF`.
- **Screen Display**:
  - A screen will be displayed prompting the user to confirm the generation of the Merkle Proof. ![Bandada Generate Proof screen](./screenshots/bandada-generate.png "Bandada Generate Proof screen")
- **Action**: This action sends a request to the CryptKeeper service to generate the Group Merkle Proof using the specified groupId.

```ts
// 3
```

## 3. Listen to `GROUP_MERKLE_PROOF` Event

- **Description**: Application can to listen to `EventNames.GROUP_MERKLE_PROOF` to get notified by this action response.
- **Action**: CryptKeeper will fire an `EventNames.GROUP_MERKLE_PROOF` once the Group Merkle Proof has been successfully generated.

```ts
// 4
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
