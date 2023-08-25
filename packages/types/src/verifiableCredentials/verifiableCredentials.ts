/**
 * The following references are derived from the Verifiable Credentials Data Model 1.0 Standard
 *  (https://www.w3.org/TR/vc-data-model).
 */

/**
 * @typedef {object} IVerifiableCredential
 * @description A credential is a set of one or more claims made by the same entity.
 * Credentials might also include an identifier and metadata to describe properties
 * of the credential, such as the issuer, the expiry date and time, a representative
 * image, a public key to use for verification purposes, the revocation mechanism,
 * and so on. The metadata might be signed by the issuer. A verifiable credential is
 * a set of tamper-evident claims and metadata that cryptographically prove who issued it.
 */
export interface IVerifiableCredential {
  /**
   * @property {string[]} context - The value of the @context property MUST be an ordered set where the first
   * item is a URI with the value https://www.w3.org/2018/credentials/v1.
   */
  context: string[];

  /**
   * @property {string} [id] - If the id property is present, the id property MUST express an identifier
   * that others are expected to use when expressing statements about a specific thing
   * identified by that identifier.
   */
  id?: string;

  /**
   * @property {string[]} type - The value of the type property MUST be, or map to (through interpretation
   * of the @context property), one or more URIs.
   */
  type: string[];

  /**
   * @property {string|CredentialIssuer} issuer - The value of the issuer property MUST be either a URI or an object
   * containing an id property.
   */
  issuer: string | ICredentialIssuer;

  /**
   * @property {Date} issuanceDate - A credential MUST have an issuanceDate property. The value of the
   * issuanceDate property MUST be a string value of an XMLSCHEMA11-2 combined date-time
   * string representing the date and time the credential becomes valid, which could be a
   * date and time in the future.
   */
  issuanceDate: Date;

  /**
   * @property {Date} [expirationDate] - If present, the value of the expirationDate property MUST be a string
   * value of an XMLSCHEMA11-2 date-time representing the date and time the credential
   * ceases to be valid.
   */
  expirationDate?: Date;

  /**
   * @property {CredentialSubject} credentialSubject - The value of the credentialSubject property is defined as a set of objects
   * that contain one or more properties that are each related to a subject of the verifiable
   * credential. Each object MAY contain an id.
   */
  credentialSubject: ICredentialSubject;

  /**
   * @property {CredentialStatus} [credentialStatus] - If present, the value of the credentialStatus property MUST include the
   * following: id property, which MUST be a URI, and type property, which expresses the
   * credential status type.
   */
  credentialStatus?: ICredentialStatus;

  /**
   * @property {CredentialProof[]} [proof] - One or more cryptographic proofs that can be used to detect tampering and
   * verify the authorship of a credential or presentation. The specific method used for an
   * embedded proof MUST be included using the type property.
   */
  proof?: ICredentialProof[];
}

/**
 * @typedef {object} CredentialIssuer
 * @description Represents the issuer of a credential.
 */
export interface ICredentialIssuer {
  /**
   * @property {string} [id] - The identifier of the issuer.
   */
  id?: string;
}

/**
 * @typedef {object} CredentialSubject
 * @description Represents the subject of a credential.
 */
export interface ICredentialSubject {
  /**
   * @property {string} [id] - The identifier of the subject.
   */
  id?: string;

  /**
   * @property {Record<string, ClaimValue>} claims - The subject claims.
   */
  claims: Record<string, ClaimValue>;
}

/**
 * @typedef {object} CredentialStatus
 * @description Represents the status of a credential.
 */
export interface ICredentialStatus {
  /**
   * @property {string} id - The identifier of the credential status.
   */
  id: string;

  /**
   * @property {string} type - The type of the credential status.
   */
  type: string;
}

/**
 * @typedef {string | ClaimValue[] | {[key: string]: ClaimValue}} ClaimValue
 *
 * @description Represents the value of a claim in a verifiable credential.
 * The value of a claim can be a string, an array of claim values, or an object
 * containing nested claim values. This allows for flexible representation of claim values
 * in verifiable credentials.
 */
export type ClaimValue = string | ClaimValue[] | { [key: string]: ClaimValue };

/**
 * @typedef {object} CredentialProof
 * @description A data integrity proof provides information about the proof mechanism,
 * parameters required to verify that proof, and the proof value itself.
 */
export interface ICredentialProof {
  /**
   * @property {string} [id] - An optional identifier for the proof, which MUST be a URL, such as a
   * UUID as a URN (urn:uuid:6a1676b8-b51f-11ed-937b-d76685a20ff5).
   */
  id?: string;

  /**
   * @property {string[]} type - The specific proof type used for the cryptographic proof MUST be
   * specified as a string that maps to a URL.
   */
  type: string[];

  /**
   * @property {string} proofPurpose - The reason the proof was created MUST be specified as a string that
   * maps to a URL.
   */
  proofPurpose: string;

  /**
   * @property {string} verificationMethod - The means and information needed to verify the proof MUST be specified
   * as a string that maps to a URL.
   */
  verificationMethod: string;

  /**
   * @property {Date} created - The date and time the proof was created MUST be specified as an
   * XMLSCHEMA11-2 combined date and time string.
   */
  created: Date;

  /**
   * @property {string} proofValue - A string value that contains the data necessary to verify the digital
   * proof using the verificationMethod specified.
   */
  proofValue: string;
}
