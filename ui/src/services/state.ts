import { useEffect, useState } from 'preact/hooks'

export class StateContainer<T> extends EventTarget {
    private value: T | undefined
    constructor(private init: () => Promise<T> | T) {
        super()
    }

    async getValue(): Promise<T> {
        if (this.value === undefined) {
            this.value = await this.init()
        }
        return this.value
    }

    setValue(value: T): void {
        this.dispatchEvent(new Event('change'))
        this.value = value
    }
}

export function useStateContainer<T>(sc: StateContainer<T>): T | undefined {
    const [value, set] = useState<T>()

    useEffect(() => {
        const change = () => {
            sc.getValue().then(v => set(v))
        }
        change()

        sc.addEventListener('change', change)

        return () => {
            sc.removeEventListener('change', change)
        }
    }, [sc])
    return value
}
