import { createStore, get, set } from 'idb-keyval'
import { useCallback, useEffect, useState } from 'preact/hooks'

const store = createStore('persistent-state', 'persistent-state')

export function usePersistentState<T>(
    key: string,
    initialState: T,
): [T, (t: T | ((t: T) => T)) => void] {
    const [value, setValue] = useState(initialState)

    const fullSetValue = useCallback(
        (v: T | ((t: T) => T)) => {
            if (v instanceof Function) {
                v = v(value)
            }
            set(key, v, store)
            setValue(v)
        },
        [key, value, setValue],
    )

    useEffect(() => {
        get(key, store).then(v => {
            if (v !== undefined) {
                setValue(v)
            }
        })
    }, [setValue])

    return [value, fullSetValue]
}
