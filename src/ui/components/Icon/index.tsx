/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prefer-stateless-function */
import React, { Component, MouseEventHandler } from 'react'
import c from 'classnames'
import './icon.scss'

type Props = {
    url?: string
    fontAwesome?: string
    className?: string
    size?: number
    onClick?: MouseEventHandler
    disabled?: boolean
}

export default class Icon extends Component<Props> {
    render() {
        const { url, size = 0.75, className = '', disabled, fontAwesome, onClick } = this.props

        return (
            <div
                className={c('icon', className, {
                    'icon--disabled': disabled,
                    'icon--clickable': onClick
                })}
                style={{
                    backgroundImage: url ? `url(${url})` : undefined,
                    width: !fontAwesome ? `${size}rem` : undefined,
                    height: !fontAwesome ? `${size}rem` : undefined,
                    fontSize: fontAwesome && `${size}rem`
                }}
                onClick={onClick}
            >
                {fontAwesome && <i className={`fas ${fontAwesome}`} />}
            </div>
        )
    }
}
