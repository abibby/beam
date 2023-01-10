import { useCallback, useState } from 'preact/hooks'

export function useQueryState(
    key: string,
    initialState: string,
): [string, (t: string | number) => void] {
    const u = new URL(location.href)
    const [value, setValue] = useState(u.searchParams.get(key) ?? initialState)

    const fullSetValue = useCallback(
        (v: string | number) => {
            const strV = String(v)
            const u = new URL(location.href)
            u.searchParams.set(key, strV)
            setValue(strV)
            history.replaceState({}, '', u.toString())
        },
        [key, setValue],
    )

    return [value, fullSetValue]
}
