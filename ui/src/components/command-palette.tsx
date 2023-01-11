import { bindValue } from '@zwzn/spicy'
import classNames from 'classnames'
import { h } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'
import { useClickAway } from '../hooks/use-click-away'
import { useCommand } from '../services/bindings'
import styles from './command-palette.module.css'
h

export interface CommandPaletteProps {}

export function CommandPalette({}: CommandPaletteProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const input = useRef<HTMLInputElement | null>(null)

    const openPalette = useCallback(
        (str: string) => {
            setOpen(true)
            setSearch(str)
            setTimeout(() => {
                input.current?.focus()
            })
        },
        [setOpen, setSearch],
    )

    useCommand('palette.openTable', () => openPalette(''), [openPalette])
    // useCommand('palette.openDatabase', () => openPalette('> '), [openPalette])
    useCommand('palette.close', () => setOpen(false), [setOpen])

    const root = useClickAway<HTMLDivElement>(() => {
        setOpen(false)
    }, [setOpen])
    return (
        <div
            class={classNames(styles.palette, { [styles.open]: open })}
            ref={root}
        >
            <input
                class={styles.input}
                type='text'
                value={search}
                onInput={bindValue(setSearch)}
                ref={input}
            />
        </div>
    )
}
