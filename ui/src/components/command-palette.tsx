import { bindValue } from '@zwzn/spicy'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { h } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'
import { useClickAway } from '../hooks/use-click-away'
import { useCommand } from '../services/bindings'
import { useStateContainer } from '../services/state'
import { tables } from '../state/tables'
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
            <TableResults query={search} />
        </div>
    )
}

interface TableResultsProps {
    query: string
}

function TableResults({ query }: TableResultsProps) {
    const schema = useStateContainer(tables)
    const results: Array<{ db: string; table: string }> = []
    for (const [db, names] of schema ?? []) {
        for (const name of names) {
            results.push({ db: db, table: name })
        }
    }

    const f = new Fuse(results, {
        includeScore: true,
        keys: ['db', 'table'],
    })

    return (
        <div>
            {f
                .search(query)
                .slice(0, 20)
                .map(r => (
                    <div>
                        {r.item.db} - {r.item.table}
                    </div>
                ))}
        </div>
    )
}
