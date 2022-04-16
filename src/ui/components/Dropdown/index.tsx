/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import React, { InputHTMLAttributes, ReactElement } from 'react'
import './dropdown.scss'
import classNames from 'classnames'

type Props = {
    label?: string
    errorMessage?: string
    options: { value: string; label?: string }[]
} & InputHTMLAttributes<HTMLSelectElement>

export default function Dropdown(props: Props): ReactElement {
    const { label, errorMessage, className, ...selectProps } = props
    return (
        <div className={classNames('dropdown', className)}>
            {label && <div className="dropdown__label">{label}</div>}
            <div className="dropdown__group">
                <select {...selectProps}>
                    {props.options.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label || value}
                        </option>
                    ))}
                </select>
            </div>
            {errorMessage && <div className="dropdown__error-message">{errorMessage}</div>}
        </div>
    )
}
