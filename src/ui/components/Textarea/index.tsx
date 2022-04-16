/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable react/function-component-definition */
import React, { MouseEventHandler, TextareaHTMLAttributes } from 'react'

import './textarea.scss'
import classNames from 'classnames'

type Props = {
    label?: string
    errorMessage?: string
    fontAwesome?: string
    url?: string
    onIconClick?: MouseEventHandler
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export default function Textarea(props: Props) {
    const { fontAwesome, onIconClick, label, errorMessage, className, ...textareaProps } = props

    return (
        <div className={classNames(`textarea-group`, className)}>
            {label && <div className="textarea-group__label">{label}</div>}
            <div className="textarea-group__group">
                <textarea className="textarea" {...textareaProps} />
            </div>
            {errorMessage && <div className="textarea-group__error-message">{errorMessage}</div>}
        </div>
    )
}
