import React, { MouseEvent, ReactElement, ReactNode, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import './menuable.scss'
import Icon from '../Icon'

type MenuableProps = {
    items: ItemProps[]
    children?: ReactNode
    className?: string
    menuClassName?: string
    onOpen?: () => void
    onClose?: () => void
    opened?: boolean
}

export type ItemProps = {
    label: string
    iconUrl?: string
    iconFA?: string
    iconClassName?: string
    className?: string
    onClick?: (e: MouseEvent, reset: () => void) => void
    disabled?: boolean
    children?: ItemProps[]
    component?: ReactNode
}

export default function Menuable(props: MenuableProps): ReactElement {
    const { opened } = props

    const [isShowing, setShowing] = useState(!!props.opened)
    const [path, setPath] = useState<number[]>([])

    useEffect(() => {
        if (typeof opened !== 'undefined') {
            setShowing(opened)
            if (!opened) {
                setPath([])
            }
        }
    }, [opened])

    const onClose = useCallback(() => {
        props.onClose && props.onClose()
        setShowing(false)
    }, [])

    const onOpen = useCallback(() => {
        props.onOpen && props.onOpen()
        setShowing(true)

        const cb = () => {
            onClose()
            window.removeEventListener('click', cb)
        }

        window.addEventListener('click', cb)
    }, [onClose])

    const goBack = useCallback(
        (e) => {
            e.stopPropagation()
            const newPath = [...path]
            newPath.pop()
            setPath(newPath)
        },
        [path]
    )

    const onItemClick = useCallback(
        (e, item, i) => {
            e.stopPropagation()
            if (item.disabled) return
            if (item.children) {
                setPath([...path, i])
            } else if (item.onClick) {
                item.onClick(e, () => setPath([]))
            }
        },
        [path]
    )

    let {items} = props

    if (path) {
        for (const pathIndex of path) {
            if (items[pathIndex].children) {
                items = items[pathIndex].children as ItemProps[]
            }
        }
    }

    return (
        <div
            className={classNames(
                'menuable',
                {
                    'menuable--active': isShowing
                },
                props.className
            )}
            onClick={(e) => {
                e.stopPropagation()

                if (isShowing) return onClose()
                onOpen()
            }}
        >
            {props.children}
            {isShowing && (
                <div className={classNames('rounded-xl border border-gray-700 menuable__menu', props.menuClassName)}>
                    {!!path.length && (
                        <div
                            className={classNames(
                                'text-sm whitespace-nowrap cursor-pointer',
                                'flex flex-row flex-nowrap items-center',
                                'text-gray-500 hover:text-gray-300 hover:bg-gray-900 menuable__menu__item'
                            )}
                            onClick={goBack}
                        >
                            <Icon fontAwesome="fas fa-caret-left" />
                            <span className="ml-2">Go back</span>
                        </div>
                    )}
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className={classNames(
                                'text-sm whitespace-nowrap',
                                'flex flex-row flex-nowrap items-center',
                                'menuable__menu__item hover:bg-gray-900 ',
                                { 'cursor-pointer': !item.disabled },
                                item.className
                            )}
                            onClick={(e) => onItemClick(e, item, i)}
                        >
                            {item.component ? (
                                item.component
                            ) : (
                                <>
                                    <div
                                        className={classNames('flex-grow', {
                                            'text-gray-500 hover:text-gray-300 hover:font-semibold': !item.disabled,
                                            'text-gray-700': item.disabled
                                        })}
                                    >
                                        {item.label}
                                    </div>
                                    {(item.iconUrl || item.iconFA) && (
                                        <Icon
                                            fontAwesome={item.iconFA}
                                            url={item.iconUrl}
                                            className={classNames(
                                                'ml-4',
                                                {
                                                    'opacity-50': item.disabled
                                                },
                                                item.iconClassName
                                            )}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
