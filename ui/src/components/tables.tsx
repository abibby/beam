import {
    faChevronDown,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { bind, bindValue } from '@zwzn/spicy'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { query } from '../api/database'
import { usePersistentState } from '../hooks/use-persistent-state'
import { Icon } from './icon'
import styles from './tables.module.css'

h

export interface TableProps {
    onSelectTable: (table: string, database: string) => void
}

export function Tables({ onSelectTable }: TableProps) {
    const [schema, setSchema] = useState<Array<[string, string[]]> | null>(null)
    useEffect(() => {
        query({
            database: 'default',
            query: 'select `table_schema`, `table_name` from `information_schema`.`tables`',
            args: [],
        }).then(result => {
            if ('error' in result) {
                return
            }

            const dbs = new Map<string, string[]>()

            for (const [database, table] of result.data) {
                if (database === null || table === null) {
                    continue
                }
                let t = dbs.get(database)
                if (t === undefined) {
                    t = []
                }
                dbs.set(database, t.concat(table))
            }

            setSchema(
                Array.from(dbs)
                    .map(([name, tables]): [string, string[]] => [
                        name,
                        tables.sort(),
                    ])
                    .sort((a, b) => a[0].localeCompare(b[0])),
            )
        })
    }, [setSchema])

    const [search, setSearch] = usePersistentState('tables-search', '')
    console.log(search)

    if (schema === null) {
        return <div>loading...</div>
    }

    return (
        <div class={styles.tables}>
            <input value={search} onInput={bindValue(setSearch)} />
            <ul class={styles.databaseList}>
                {schema.map(([database, tables]) => (
                    <Database
                        database={database}
                        tables={tables}
                        search={search}
                        onSelectTable={onSelectTable}
                    />
                ))}
            </ul>
        </div>
    )
}

interface DatabaseProps {
    database: string
    tables: string[]
    search: string
    onSelectTable: (table: string, database: string) => void
}

function Database({ database, tables, search, onSelectTable }: DatabaseProps) {
    const [open, setOpen] = usePersistentState(`tables-${database}-open`, false)
    const toggleOpen = useCallback(() => setOpen(o => !o), [setOpen])

    const openIcon = open ? faChevronDown : faChevronRight

    const filteredTables = tables.filter(table =>
        table.toLowerCase().includes(search.toLowerCase()),
    )
    return (
        <li class={styles.database}>
            <div class={styles.databaseName} onClick={toggleOpen}>
                <Icon icon={openIcon} /> {database} [{filteredTables.length}]
            </div>
            {open && (
                <TableList
                    database={database}
                    tables={filteredTables}
                    onSelectTable={onSelectTable}
                />
            )}
        </li>
    )
}

interface TableListProps {
    database: string
    tables: string[]
    onSelectTable: (table: string, database: string) => void
}

function TableList({ database, tables, onSelectTable }: TableListProps) {
    return (
        <ul class={styles.tableList}>
            {tables.map(table => (
                <li
                    class={styles.table}
                    onClick={bind(table, database, onSelectTable)}
                >
                    {table}
                </li>
            ))}
        </ul>
    )
}
