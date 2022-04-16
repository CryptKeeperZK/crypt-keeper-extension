import React, { ReactElement, useCallback, useState } from 'react'
import './login.scss'
import Button, { ButtonType } from '@src/ui/components/Button'
import Icon from '@src/ui/components/Icon'
import LogoSVG from '@src/static/icons/logo.svg'
import Input from '@src/ui/components/Input'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'

const Login = function(): ReactElement {
    const [pw, setPW] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const valid = !!pw

    const login = useCallback(async () => {
        if (!valid) {
            setError('Invalid password')
            return
        }

        setLoading(true)

        try {
            await postMessage({
                method: RPCAction.UNLOCK,
                payload: pw
            })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [pw])

    return (
        <div className="flex flex-col flex-nowrap h-full login">
            <div className="flex flex-col items-center flex-grow p-8 login__content">
                <Icon url={LogoSVG} />
                <div className="text-lg pt-8">
                    <b>Welcome Back!</b>
                </div>
                <div className="text-base">To continue, please unlock your wallet</div>
                <div className="py-8 w-full">
                    <Input
                        className="mb-4"
                        type="password"
                        label="Password"
                        value={pw}
                        onChange={(e) => setPW(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="flex flex-row items-center justify-center flex-shrink p-8 login__footer">
                <Button btnType={ButtonType.primary} disabled={!pw} onClick={login} loading={loading}>
                    Unlock
                </Button>
            </div>
        </div>
    )
}

export default Login;
