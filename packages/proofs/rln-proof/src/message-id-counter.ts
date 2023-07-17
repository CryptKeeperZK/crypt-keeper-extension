/**
 * Always return **next** the current counter value and increment the counter.
 * @param epoch epoch of the message
 * @throws Error if the counter exceeds the message limit
 */
export interface IMessageIDCounter {
  messageLimit: bigint;
  /**
   * Return the current counter value and increment the counter.
   *
   * @param epoch
   */
  getMessageIDAndIncrement(epoch: bigint): Promise<bigint>
}

type EpochMap = {
  [epoch: string]: bigint
}

export class MemoryMessageIDCounter implements IMessageIDCounter {
  protected _messageLimit: bigint

  protected epochToMessageID: EpochMap

  constructor(messageLimit: bigint) {
    this._messageLimit = messageLimit
    this.epochToMessageID = {}
  }

  get messageLimit(): bigint {
    return this._messageLimit
  }

  async getMessageIDAndIncrement(epoch: bigint): Promise<bigint> {
    const epochStr = epoch.toString()
    // Initialize the message id counter if it doesn't exist
    if (this.epochToMessageID[epochStr] === undefined) {
      this.epochToMessageID[epochStr] = BigInt(0)
    }
    const messageID = this.epochToMessageID[epochStr]
    if (messageID >= this.messageLimit) {
      throw new Error(`Message ID counter exceeded message limit ${this.messageLimit}`)
    }
    this.epochToMessageID[epochStr] = messageID + BigInt(1)
    return messageID
  }
}