import { Inputs, useEffect } from 'preact/hooks'

export interface Binding {
    command: string
    keyBinding: string
    when?: string
    key: string
    modifiers: Set<string>
}

const bindings: Array<Pick<Binding, 'command' | 'keyBinding'>> = [
    {
        command: 'format',
        keyBinding: 'shift+alt+f',
    },
    {
        command: 'format',
        keyBinding: 'ctrl+p',
    },
]

const commands = new Map<string, () => void>()

const processedBindings = new Map<string, Binding[]>()
for (const b of bindings) {
    const keys = b.keyBinding.split('+')
    const key = keys[keys.length - 1].toLowerCase()
    const modifiers = new Set(keys.slice(0, -1).map(m => m.toLowerCase()))

    processedBindings.set(key, [
        {
            ...b,
            key: key,
            modifiers: modifiers,
        },
    ])
}

export function getCommands(event: KeyboardEvent): string[] {
    const bindings = processedBindings
        .get(event.key.toLowerCase())
        ?.filter(
            b =>
                b.modifiers.has('alt') === event.altKey &&
                b.modifiers.has('shift') === event.shiftKey &&
                b.modifiers.has('ctrl') === event.ctrlKey &&
                b.modifiers.has('meta') === event.metaKey,
        )
    if ((bindings?.length ?? 0) > 0) {
        event.preventDefault()
    }

    return bindings?.map(b => b.command) ?? []
}

export function initKeyBindings() {
    window.addEventListener('keydown', e => {
        for (const name of getCommands(e)) {
            commands.get(name)?.()
        }
    })
}

export function registerCommand(name: string, action: () => void): void {
    commands.set(name, action)
}
export function unregisterCommand(name: string): void {
    commands.delete(name)
}

export function useCommand(
    name: string,
    action: () => void,
    inputs: Inputs,
): void {
    useEffect(() => {
        registerCommand(name, action)

        return () => unregisterCommand(name)
    }, inputs)
}
