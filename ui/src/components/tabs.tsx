import { bind } from '@zwzn/spicy'
import classNames from 'classnames'
import { h } from 'preact'
import { useCallback } from 'preact/hooks'
import styles from './tabs.module.css'

h

export interface Tab {
    id: number
    name: string
    query: string
}

export interface TabsProps {
    tabs: Tab[]
    activeTab: Tab
    onActiveTabChange: (t: Tab) => void
    onNewTab: (t: Tab) => void
    onCloseTab: (t: Tab) => void
}

export function Tabs({
    tabs,
    activeTab,
    onActiveTabChange,
    onNewTab,
    onCloseTab,
}: TabsProps) {
    const newTab = useCallback(() => {
        const maxQuery =
            tabs
                .map(t => {
                    return t.name.match(/query \((\d+)\)/)?.[1] ?? undefined
                })
                .filter(t => t !== undefined)
                .map(Number)
                .sort((a, b) => b - a)[0] ?? 0

        onNewTab({
            id: Math.random(),
            name: `query (${maxQuery + 1})`,
            query: '',
        })
    }, [tabs])
    return (
        <div class={styles.tabs}>
            {tabs.map((t, i) => {
                const first = i === 0
                const afterActive = tabs[i - 1]?.id === activeTab.id
                const last = i === tabs.length - 1
                const beforeActive = tabs[i + 1]?.id === activeTab.id
                return (
                    <div
                        class={classNames(styles.tab, {
                            [styles.active]: t.id === activeTab.id,
                            [styles.first]: first,
                            [styles.last]: last,
                            [styles.beforeActive]: beforeActive,
                            [styles.afterActive]: afterActive,
                        })}
                        onClick={bind(t, onActiveTabChange)}
                    >
                        {t.name}
                        <button
                            class={t === activeTab ? 'active' : undefined}
                            onClick={bind(t, onCloseTab)}
                        >
                            X
                        </button>
                    </div>
                )
            })}
            <button onClick={newTab}>+</button>
        </div>
    )
}
