import { bind } from '@zwzn/spicy'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { query, QueryResponse } from '../api/database'
import { Editor } from '../components/editor'
import { Result } from '../components/result'
import { Tables } from '../components/tables'
import { Tab, Tabs } from '../components/tabs'
import { usePersistentState } from '../hooks/use-persistent-state'
import { useWindowEvent } from '../hooks/use-window-event'
import {
    clearWhere,
    isOrderedBy,
    parse,
    setOrderBy,
    setWhere,
    stringify,
} from '../services/sql'
import styles from './home.module.css'

h

const queryResults = new Map<number, QueryResponse>()

const defaultTab = {
    id: Math.random(),
    name: 'default',
    query: '',
}

export function Home() {
    const [tabs, setTabs] = usePersistentState<Tab[]>('home-tabs', [defaultTab])
    const [activeTab, setActiveTab] = usePersistentState<Tab>(
        'home-active-tab',
        defaultTab,
    )

    const [result, setResult] = useState<QueryResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const run = useCallback(
        async (q: string) => {
            const result = await query({
                database: 'default',
                query: q,
                args: [],
            })

            if ('error' in result) {
                if (activeTab) {
                    queryResults.delete(activeTab.id)
                }
                setResult(null)
                setError(result.error)
            } else {
                if (activeTab) {
                    queryResults.set(activeTab.id, result)
                }
                setResult(result)
                setError(null)
            }
        },
        [activeTab, setResult, setError],
    )

    const newTab = useCallback(
        (t: Tab) => {
            setTabs(tabs => tabs.concat(t))
        },
        [setTabs],
    )

    const closeTab = useCallback(
        (tabToClose: Tab) => {
            setTabs(tabs => tabs.filter(t => t !== tabToClose))
            queryResults.delete(tabToClose.id)
        },
        [setTabs],
    )

    const openTab = useCallback(
        (t: Tab) => {
            setActiveTab(t)
            const result = queryResults.get(t.id)
            if (result !== undefined) {
                setResult(result)
            } else {
                setResult(null)
            }
        },
        [setActiveTab, setResult],
    )

    const setActiveTabQuery = useCallback(
        (query: string) => {
            const newActiveTab: Tab = {
                ...defaultTab,
                ...activeTab,
                query: query,
            }
            setTabs(tabs =>
                tabs.map(t => {
                    if (t === activeTab) {
                        return newActiveTab
                    }
                    return t
                }),
            )
            setActiveTab(newActiveTab)
        },
        [setTabs, activeTab, setActiveTab],
    )

    useWindowEvent(
        'keydown',
        e => {
            if (e.code === 'Enter' && e.ctrlKey) {
                if (activeTab !== null) {
                    run(activeTab.query)
                }
            }
        },
        { passive: true },
        [activeTab, run],
    )

    const selectTable = useCallback(
        (table: string, database: string) => {
            const q = `select * from \`${database}\`.\`${table}\` limit 100;`
            const t = {
                id: Math.random(),
                name: table,
                query: q,
            }
            newTab(t)
            openTab(t)
            run(q)
        },
        [setActiveTabQuery, run],
    )

    const changeOrder = useCallback(
        (column: string) => {
            if (activeTab === null) {
                return
            }

            const m = parse(activeTab.query)

            switch (isOrderedBy(m, column)) {
                case null:
                    setOrderBy(m, column, 'asc')
                    break
                case 'asc':
                    setOrderBy(m, column, 'desc')
                    break
                case 'desc':
                    setOrderBy(m, column, null)
                    break
            }
            const newQuery = stringify(m)
            setActiveTabQuery(newQuery)
            run(newQuery)
        },
        [activeTab, setActiveTabQuery, run],
    )

    const search = useCallback(
        (column: string, s: string) => {
            if (activeTab === null) {
                return
            }

            const m = parse(activeTab.query)
            if (s === '') {
                clearWhere(m, column)
            } else {
                setWhere(m, column, 'like', s)
            }
            setActiveTabQuery(stringify(m))
        },
        [activeTab, setActiveTabQuery],
    )

    useEffect(() => {
        if (activeTab !== null && activeTab.query !== '') {
            run(activeTab.query)
        }
    }, [])

    return (
        <div class={styles.home}>
            <div class={styles.sidebar}>
                <Tables onSelectTable={selectTable} />
            </div>
            <div class={styles.query}>
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onActiveTabChange={openTab}
                    onNewTab={newTab}
                    onCloseTab={closeTab}
                />
                <Editor
                    code={activeTab?.query ?? ''}
                    onChange={setActiveTabQuery}
                />
                {/* <textarea
                    class={styles.textarea}
                    value={activeTab?.query ?? ''}
                    onInput={bindValue(setActiveTabQuery)}
                    // onKeyDown={keyDown}
                />
                <Highlight code={activeTab?.query ?? ''} /> */}
                <button
                    class={styles.run}
                    onClick={bind(activeTab?.query ?? '', run)}
                >
                    Run
                </button>
            </div>
            <div class={styles.results}>
                {error && <pre class={styles.error}>{error}</pre>}
                {result && (
                    <Result
                        query={activeTab?.query ?? ''}
                        result={result}
                        onChangeOrder={changeOrder}
                        onSearch={search}
                    />
                )}
            </div>
        </div>
    )
}
