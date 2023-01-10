export interface QueryRequest {
    database: string
    query: string
    args: unknown[]
}

export interface QueryResponse {
    columns: string[]
    types: string[]
    data: (string|null)[][]
}

export interface APIErrorResponse {
    error: string
}

export async function query(request: QueryRequest): Promise<QueryResponse|APIErrorResponse> {
    return fetch("/query", {
        method: 'POST',
        body: JSON.stringify(request),
    }).then(r => r.json())
}