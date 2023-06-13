/** The following references are derived from the Verifiable Credentials Data Model 1.0 Standard
 *  (https://www.w3.org/TR/vc-data-model).
 */

/** Reference: A credential is a set of one or more claims made by the same entity.
 * Credentials might also include an identifier and metadata to describe properties
 * of the credential, such as the issuer, the expiry date and time, a representative
 * image, a public key to use for verification purposes, the revocation mechanism,
 * and so on. The metadata might be signed by the issuer. A verifiable credential is
 * a set of tamper-evident claims and metadata that cryptographically prove who issued it.
 */
export interface Credential {
  /** Reference: The value of the @context property MUST be an ordered set where the first
   * item is a URI with the value https://www.w3.org/2018/credentials/v1.
   */
  context: string[];

  /** Reference: If the id property is present, the id property MUST express an identifier
   * that others are expected to use when expressing statements about a specific thing
   * identified by that identifier.
   */
  id?: string;

  /** Reference: The value of the type property MUST be, or map to (through interpretation
   * of the @context property), one or more URIs.
   */
  type: string[];

  /** Reference: The value of the issuer property MUST be either a URI or an object
   * containing an id property.
   */
  issuer: string | Issuer;

  /** Reference: A credential MUST have an issuanceDate property. The value of the
   * issuanceDate property MUST be a string value of an XMLSCHEMA11-2 combined date-time
   * string representing the date and time the credential becomes valid, which could be a
   * date and time in the future.
   */
  issuanceDate: Date;

  /** Reference: If present, the value of the expirationDate property MUST be a string
   * value of an XMLSCHEMA11-2 date-time representing the date and time the credential
   * ceases to be valid.
   */
  expirationDate?: Date;

  /** Reference: The value of the credentialSubject property is defined as a set of objects
   * that contain one or more properties that are each related to a subject of the verifiable
   * credential. Each object MAY contain an id.
   */
  credentialSubject: Subject;

  /** Reference: If present, the value of the credentialStatus property MUST include the
   * following: id property, which MUST be a URI, and type property, which expresses the
   * credential status type.
   */
  credentialStatus?: Status;
}

export interface VerifiableCredential extends Credential {
  /** Reference: One or more cryptographic proofs that can be used to detect tampering and
   * verify the authorship of a credential or presentation. The specific method used for an
   * embedded proof MUST be included using the type property.
   */
  proof?: CredentialsProof[];
}

/** Reference: Presentations MAY be used to combine and present credentials. They can be
 * packaged in such a way that the authorship of the data is verifiable. The data in a
 * presentation is often all about the same subject, but there is no limit to the number
 * of subjects or issuers in the data. The aggregation of information from multiple
 * verifiable credentials is a typical use of verifiable presentations.
 */
export interface Presentation {
  context: string[];
  /** Reference: The id property is optional and MAY be used to provide a unique identifier
   * for the presentation.
   */
  id?: string;

  /** Reference: The type property is required and expresses the type of presentation,
   * such as VerifiablePresentation.
   */
  type: string[];

  /** Reference: If present, the value of the verifiableCredential property MUST be
   * constructed from one or more verifiable credentials, or of data derived from
   * verifiable credentials in a cryptographically verifiable format.
   */
  verifiableCredential?: VerifiableCredential[];

  /** Reference: If present, the value of the holder property is expected to be a
   * URI for the entity that is generating the presentation.
   */
  holder?: string;
}

export interface VerifiablePresentation extends Presentation {
  /** Reference: If present, the value of the proof property ensures that the
   * presentation is verifiable.
   */
  proof?: CredentialsProof[];
}

export interface Issuer {
  id?: string;
}

export interface Subject {
  id?: string;
  claims: Record<string, ClaimValue>;
}

export interface Status {
  id: string;
  type: string;
}

export type ClaimValue = string | ClaimValue[] | { [key: string]: ClaimValue };

/** Reference: A data integrity proof provides information about the proof mechanism,
 * parameters required to verify that proof, and the proof value itself.
 */
export interface CredentialsProof {
  /** Reference: An optional identifier for the proof, which MUST be a URL, such as a
   * UUID as a URN (urn:uuid:6a1676b8-b51f-11ed-937b-d76685a20ff5).
   */
  id?: string;

  /** Reference: The specific proof type used for the cryptographic proof MUST be
   * specified as a string that maps to a URL.
   */
  type: string[];

  /** Reference: The reason the proof was created MUST be specified as a string that
   * maps to a URL.
   */
  proofPurpose: string;

  /** Reference: The means and information needed to verify the proof MUST be specified
   * as a string that maps to a URL.
   */
  verificationMethod: string;

  /** Reference: The date and time the proof was created MUST be specified as an
   * XMLSCHEMA11-2 combined date and time string.
   */
  created: Date;

  /** Reference: A string value that contains the data necessary to verify the digital
   * proof using the verificationMethod specified.
   */
  proofValue: string;
}
