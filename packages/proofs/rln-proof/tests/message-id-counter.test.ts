import { FakeMessageIDCounter } from "./utils";

describe('MessageIDCounter', () => {
    const messageLimit = BigInt(1)
    const messageIDCounter = new FakeMessageIDCounter(messageLimit)

    test('should return correct message limit', async () => {
        expect(messageIDCounter.messageLimit).toEqual(messageLimit)
    });

    test('should return correct message ID', async () => {
        const epoch0 = BigInt(0)
        const epoch1 = BigInt(1)
        const epoch2 = BigInt(2)
        // Initial state
        expect(await messageIDCounter.peekNextMessageID(epoch0)).toEqual(BigInt(0))
        // Test: try increment for epoch 0
        expect(await messageIDCounter.getMessageIDAndIncrement(epoch0)).toEqual(BigInt(0))
        expect(await messageIDCounter.peekNextMessageID(epoch0)).toEqual(BigInt(1))

        // Test: try increment for epoch 1
        expect(await messageIDCounter.peekNextMessageID(epoch1)).toEqual(BigInt(0))
        expect(await messageIDCounter.getMessageIDAndIncrement(epoch1)).toEqual(BigInt(0))
        expect(await messageIDCounter.peekNextMessageID(epoch1)).toEqual(BigInt(1))
        // epoch0 is not affected
        expect(await messageIDCounter.peekNextMessageID(epoch0)).toEqual(BigInt(1))

        // Test: try increment for both epoch 0 and 1 again, message limits are reached
        await expect(async () => {
            await messageIDCounter.getMessageIDAndIncrement(epoch0)
        }).rejects.toThrow('Message ID counter exceeded message limit')
        await expect(async () => {
            await messageIDCounter.getMessageIDAndIncrement(epoch1)
        }).rejects.toThrow('Message ID counter exceeded message limit')

        // Test: still work for epoch 2
        expect(await messageIDCounter.getMessageIDAndIncrement(epoch2)).toEqual(BigInt(0))
    });
});
