import {
    faArrowDownWideShort,
    faArrowsUpDown,
    faArrowUpShortWide,
} from '@fortawesome/free-solid-svg-icons'
import { bind } from '@zwzn/spicy'
import { h } from 'preact'
import { QueryResponse } from '../api/database'
import { isOrderedBy, parse } from '../services/sql'
import { Icon } from './icon'
import styles from './result.module.css'

h

export interface ResultProps {
    query: string
    result: QueryResponse
    onChangeOrder: (column: string) => void
    onSearch: (column: string, search: string) => void
}

export function Result({
    query,
    result,
    onChangeOrder,
    onSearch,
}: ResultProps) {
    return (
        <table class={styles.result}>
            <thead class={styles.header}>
                {/* <tr>
                    {result.columns.map(c => (
                        <th>
                            <input onInput={bindValue(bind(c, onSearch))} />
                        </th>
                    ))}
                </tr> */}
                <tr>
                    {result.columns.map(c => (
                        <th onClick={bind(c, onChangeOrder)}>
                            <span class={styles.headerCell}>
                                <span class={styles.columnName}>{c}</span>
                                <OrderIcon query={query} column={c} />
                            </span>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody class={styles.body}>
                {result.data.map(row => (
                    <tr>
                        {row.map(c => {
                            if (c === null) {
                                return <td class={styles.null}>NULL</td>
                            }
                            return <td>{c}</td>
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

interface OrderChevronProps {
    query: string
    column: string
}

function OrderIcon({ query, column }: OrderChevronProps) {
    let icon = faArrowsUpDown

    switch (isOrderedBy(parse(query), column)) {
        case 'asc':
            icon = faArrowUpShortWide
            break
        case 'desc':
            icon = faArrowDownWideShort
            break
    }

    return (
        <span class={styles.order}>
            <Icon icon={icon} />
        </span>
    )
}
