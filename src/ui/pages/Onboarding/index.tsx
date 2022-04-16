import React, { ReactElement, useCallback, useState } from 'react'
import './onboarding.scss'
import Button, { ButtonType } from '@src/ui/components/Button'
import Icon from '@src/ui/components/Icon'
import LogoSVG from '@src/static/icons/logo.svg'
import Input from '@src/ui/components/Input'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'

export default function Onboarding(): ReactElement {
    const [pw, setPW] = useState('')
    const [pw2, setPW2] = useState('')
    const [error, setError] = useState('')

    const valid = !!pw && pw === pw2

    const createPassword = useCallback(async () => {
        if (!valid) {
            setError('Invalid password')
            return
        }

        try {
            await postMessage({
                method: RPCAction.SETUP_PASSWORD,
                payload: pw
            })
        } catch (e: any) {
            setError(e.message)
        }
    }, [pw, pw2])

    return (
        <div className="flex flex-col flex-nowrap h-full onboarding">
            <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
                <Icon url={LogoSVG} />
                <div className="text-lg pt-8">
                    <b>Thanks for using ZKeeper!</b>
                </div>
                <div className="text-base">To continue, please setup a password</div>
                <div className="py-8 w-full">
                    <Input
                        className="mb-4"
                        type="password"
                        label="Password"
                        value={pw}
                        onChange={(e) => setPW(e.target.value)}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={pw2}
                        onChange={(e) => setPW2(e.target.value)}
                    />
                </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="flex flex-row items-center justify-center flex-shrink p-8 onboarding__footer">
                <Button btnType={ButtonType.primary} disabled={!pw || pw !== pw2} onClick={createPassword}>
                    Continue
                </Button>
            </div>
        </div>
    )
}
