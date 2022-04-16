import React, { InputHTMLAttributes, MouseEventHandler } from 'react'

import './input.scss'
import classNames from 'classnames'
import Icon from '../Icon'

type Props = {
    label?: string
    errorMessage?: string
    fontAwesome?: string
    url?: string
    onIconClick?: MouseEventHandler
} & InputHTMLAttributes<HTMLInputElement>

export default function Input(props: Props) {
    const { fontAwesome, url, size = 1, onIconClick, label, errorMessage, className, ...inputProps } = props

    return (
        <div className={classNames(`input-group`, className)}>
            {label && <div className="input-group__label">{label}</div>}
            <div className="input-group__group">
                <input
                    className={classNames('input', {
                        'input--full-width': !url && !fontAwesome
                    })}
                    title={label}
                    {...(inputProps as any)}
                />
                {(!!url || !!fontAwesome) && (
                    <Icon fontAwesome={fontAwesome} url={url} size={size} onClick={onIconClick} />
                )}
            </div>
            {errorMessage && <div className="input-group__error-message">{errorMessage}</div>}
        </div>
    )
}
