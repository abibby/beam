import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github.css'
import { h } from 'preact'

h

export interface HighlightProps {
    code: string
    class?: string
}

export function Highlight({ code, class: className }: HighlightProps) {
    const a = hljs.highlight(code, {
        language: 'sql',
    })

    return (
        <code
            class={className}
            dangerouslySetInnerHTML={{ __html: a.value }}
        ></code>
    )
}
