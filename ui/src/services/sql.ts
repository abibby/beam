const states = [
    'select',
    'from',
    'where',
    'order by',
    'limit',
    'offset',
    ';',
] as const

export type State = typeof states[number]

export function parse(sql: string): Map<State, string> {
    const query = new Map<State, string>()
    let state: State = 'select'

    let scratch = ''

    for (const c of sql.split('')) {
        scratch += c

        for (const s of states) {
            if (scratch.toLowerCase().endsWith(s)) {
                query.set(state, scratch.slice(0, s.length * -1))
                scratch = scratch.slice(s.length * -1)
                state = s
            }
        }
    }

    query.set(state, scratch)

    return query
}

export function stringify(query: Map<State, string>): string {
    let sql = ''
    for (const s of states) {
        if (query.has(s)) {
            sql += query.get(s)
        }
    }
    return sql
}

export function setOrderBy(
    m: Map<State, string>,
    column: string,
    order: 'asc' | 'desc' | null,
): Map<State, string> {
    if (order === null) {
        m.delete('order by')
    } else {
        m.set('order by', `order by ${column} ${order} `)
    }
    return m
}

export function isOrderedBy(
    m: Map<State, string>,
    column: string,
): 'asc' | 'desc' | null {
    column = column.toLowerCase()

    const order = m.get('order by')?.trim()
    if (order === undefined) {
        return null
    }
    if (order.toLowerCase() === `order by ${column} asc`) {
        return 'asc'
    }
    if (order.toLowerCase() === `order by ${column} desc`) {
        return 'desc'
    }
    return null
}

export function setWhere(
    m: Map<State, string>,
    column: string,
    operator: '=' | '!=' | '<' | '>' | 'like',
    value: string | number,
): Map<State, string> {
    m.set('where', `where ${column} ${operator} ${encodeString(`%${value}%`)} `)
    return m
}

export function clearWhere(
    m: Map<State, string>,
    column: string,
): Map<State, string> {
    m.delete('where')
    return m
}

function encodeString(s: string): string {
    return `'${s.replace("'", "\\'").replace('\\', '\\\\')}'`
}
