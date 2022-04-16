import SimpleStorage from './simple-storage'
import LockService from './lock'

const DB_KEY = '@APPROVED@'

export default class ApprovalService extends SimpleStorage {
    private allowedHosts: Array<string>

    permissions: SimpleStorage

    constructor() {
        super(DB_KEY)
        this.allowedHosts = []
        this.permissions = new SimpleStorage('@HOST_PERMISSIONS@')
    }

    getAllowedHosts = () => this.allowedHosts

    isApproved = (origin: string): boolean => this.allowedHosts.includes(origin)

    unlock = async (): Promise<boolean> => {
        const encrypedArray: Array<string> = await this.get()
        if (!encrypedArray) return true

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) =>
            LockService.decrypt(cipertext)
        )

        this.allowedHosts = await Promise.all(promises)
        return true
    }

    refresh = async () => {
        const encrypedArray: Array<string> = await this.get()
        if (!encrypedArray) {
            this.allowedHosts = []
            return
        }

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) =>
            LockService.decrypt(cipertext)
        )

        this.allowedHosts = await Promise.all(promises)
    }

    getPermission = async (host: string) => {
        const store = await this.permissions.get()
        const permission = store ? store[host] : false
        return {
            noApproval: !!permission?.noApproval
        }
    }

    setPermission = async (
        host: string,
        permission: {
            noApproval: boolean
        }
    ) => {
        const { noApproval } = permission
        const existing = await this.getPermission(host)
        const newPer = {
            ...existing,
            noApproval
        }

        const store = await this.permissions.get()
        await this.permissions.set({
            ...(store || {}),
            [host]: newPer
        })
        return newPer
    }

    add = async (payload: { host: string; noApproval?: boolean }) => {
        const { host, noApproval } = payload

        if (!host) throw new Error('No host provided')

        if (this.allowedHosts.includes(host)) return

        this.allowedHosts.push(host)

        const promises: Array<Promise<string>> = this.allowedHosts.map((allowedHost: string) =>
            LockService.encrypt(allowedHost)
        )

        const newValue: Array<string> = await Promise.all(promises)

        await this.set(newValue)
        await this.refresh()
    }

    remove = async (payload: any) => {
        const { host }: { host: string } = payload
        console.log(payload)
        if (!host) throw new Error('No address provided')

        const index: number = this.allowedHosts.indexOf(host)
        if (index === -1) return

        this.allowedHosts = [...this.allowedHosts.slice(0, index), ...this.allowedHosts.slice(index + 1)]

        const promises: Array<Promise<string>> = this.allowedHosts.map((allowedHost: string) =>
            LockService.encrypt(allowedHost)
        )

        const newValue: Array<string> = await Promise.all(promises)
        await this.set(newValue)
        await this.refresh()
    }

    /** dev only */
    empty = async (): Promise<any> => {
        if (!(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) return
        await this.clear()
        await this.refresh()
    }
}
