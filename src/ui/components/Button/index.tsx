/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/button-has-type */
/* eslint-disable react/function-component-definition */
import React, { ButtonHTMLAttributes, ReactElement } from 'react'
import classNames from 'classnames'
import './button.scss'
import Icon from '@src/ui/components/Icon'
import LoaderGIF from '../../../static/icons/loader.svg'

export enum ButtonType {
    primary,
    secondary
}

export type ButtonProps = {
    className?: string
    loading?: boolean
    btnType?: ButtonType
    small?: boolean
    tiny?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: ButtonProps): ReactElement {
    const { className, loading, children, btnType = ButtonType.primary, small, tiny, ...btnProps } = props

    return (
        <button
            className={classNames('button', className, {
                'button--small': small,
                'button--tiny': tiny,
                'button--loading': loading,
                'button--primary': btnType === ButtonType.primary,
                'button--secondary': btnType === ButtonType.secondary
            })}
            {...btnProps}
        >
            {loading && <Icon className="button__loader" url={LoaderGIF} size={2} />}
            {!loading && children}
        </button>
    )
}
