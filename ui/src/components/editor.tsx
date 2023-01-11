import { bindValue } from '@zwzn/spicy'
import { h } from 'preact'
import { useCallback } from 'preact/hooks'
import { format } from 'sql-formatter'
import { useCommand } from '../services/bindings'
import styles from './editor.module.css'
import { Highlight } from './highlightjs'

h

export interface EditorProps {
    code: string
    onChange: (code: string) => void
}

export function Editor({ code, onChange }: EditorProps) {
    const formatCode = useCallback(() => {
        onChange(format(code))
    }, [code, onChange])

    useCommand(
        'editor.format',
        () => {
            formatCode()
        },
        [formatCode],
    )

    return (
        <div class={styles.editor} style={`--lines:${code.split('\n').length}`}>
            <textarea
                class={styles.textarea}
                value={code}
                onInput={bindValue(onChange)}
            />
            <Highlight class={styles.highlighted} code={code} />
        </div>
    )
}
