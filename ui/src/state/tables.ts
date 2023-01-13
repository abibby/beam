import { query } from '../api/database'
import { StateContainer } from '../services/state'

export const tables = new StateContainer<Array<[string, string[]]> | undefined>(
    async () => {
        const result = await query({
            database: 'default',
            query: 'select `table_schema`, `table_name` from `information_schema`.`tables`',
            args: [],
        })
        if ('error' in result) {
            return undefined
        }

        const dbs = new Map<string, string[]>()

        for (const [database, table] of result.data) {
            if (database === null || table === null) {
                continue
            }
            let t = dbs.get(database)
            if (t === undefined) {
                t = []
            }
            dbs.set(database, t.concat(table))
        }

        return Array.from(dbs)
            .map(([name, tables]): [string, string[]] => [name, tables.sort()])
            .sort((a, b) => a[0].localeCompare(b[0]))
    },
)
