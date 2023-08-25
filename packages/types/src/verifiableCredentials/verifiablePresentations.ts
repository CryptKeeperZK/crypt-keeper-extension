/**
 * The following references are derived from the Verifiable Credentials Data Model 1.0 Standard
 *  (https://www.w3.org/TR/vc-data-model).
 */

import { ICredentialProof, IVerifiableCredential } from "./verifiableCredentials";

/**
 * @typedef {object} VerifiablePresentation
 * @description Presentations MAY be used to combine and present credentials. They can be
 * packaged in such a way that the authorship of the data is verifiable. The data in a
 * presentation is often all about the same subject, but there is no limit to the number
 * of subjects or issuers in the data. The aggregation of information from multiple
 * verifiable credentials is a typical use of verifiable presentations.
 */
export interface IVerifiablePresentation {
  /**
   * @property {string[]} context - The context of the presentation.
   */
  context: string[];

  /**
   * @property {string} [id] - The id property is optional and MAY be used to provide a unique identifier
   * for the presentation.
   */
  id?: string;

  /**
   * @property {string[]} type - The type property is required and expresses the type of presentation,
   * such as VerifiablePresentation.
   */
  type: string[];

  /**
   * @property {VerifiableCredential[]} [verifiableCredential] - If present, the value of the verifiableCredential property MUST be
   * constructed from one or more verifiable credentials, or of data derived from
   * verifiable credentials in a cryptographically verifiable format.
   */
  verifiableCredential?: IVerifiableCredential[];

  /**
   * @property {string} [holder] - If present, the value of the holder property is expected to be a
   * URI for the entity that is generating the presentation.
   */
  holder?: string;

  /**
   * @property {CredentialProof[]} [proof] - The cryptographic proofs for the verifiable presentation.
   */
  proof?: ICredentialProof[];
}

/**
 * @typedef {object} VerifiablePresentationRequest
 * @description A verifiable presentation request is the information required to generate a
 * request for verifiable credentials.
 */
export interface IVerifiablePresentationRequest {
  /**
   * @property {string} request - The string presented to the user when prompting them for verifiable credentials.
   */
  request: string;
}
