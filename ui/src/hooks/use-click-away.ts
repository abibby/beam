import { Inputs, MutableRef, useRef } from 'preact/hooks'
import { useWindowEvent } from './use-window-event'

export function useClickAway<T extends HTMLElement>(
    callback: () => void,
    inputs: Inputs,
): MutableRef<T | null> {
    const element = useRef<T | null>(null)
    useWindowEvent(
        'click',
        event => {
            if (!hasParent(event.target, element.current)) {
                callback()
            }
        },
        false,
        [element, ...inputs],
    )
    return element
}

function hasParent(
    child: EventTarget | null,
    parent: HTMLElement | null,
): boolean {
    if (child === parent) {
        return true
    }
    if (child === null || parent === null) {
        return false
    }
    if (!(child instanceof HTMLElement)) {
        return false
    }

    let current: HTMLElement = child

    while (current.parentElement !== null) {
        if (current.parentElement === parent) {
            return true
        }
        current = current.parentElement
    }
    return false
}
