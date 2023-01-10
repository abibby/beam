import { Inputs, useEffect } from 'preact/hooks'

export function useWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options: false | AddEventListenerOptions,
    inputs: Inputs,
): void {
    useEffect(() => {
        window.addEventListener(type, listener, options)
        return () => {
            window.removeEventListener(type, listener)
        }
    }, inputs)
}
