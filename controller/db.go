package controller

import (
	"github.com/abibby/beam/config"
	"github.com/abibby/nulls"
	"github.com/abibby/validate/handler"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB

const MAX_ROWS = 1000

type QueryRequest struct {
	Database string `json:"database"`
	Query    string `json:"query"`
	Args     []any  `json:"args"`
}

type QueryResult struct {
	Columns          []string          `json:"columns"`
	Types            []string          `json:"types"`
	Data             [][]*nulls.String `json:"data"`
	ResultsTruncated bool              `json:"results_truncated"`
}

var Query = handler.Handler(func(r *QueryRequest) (any, error) {
	var err error
	if db == nil {
		cfg := config.Get()
		conn, ok := cfg.Connections[r.Database]
		if !ok {
			return handler.NewJSONResponse(map[string]string{
				"error": "invalid database",
			}).SetStatus(422), nil
		}
		db, err = sqlx.Open(conn.Driver, conn.Source)
		if err != nil {
			return nil, err
		}
	}

	rows, err := db.Queryx(r.Query, r.Args...)
	if err != nil {
		return nil, err
	}

	result := &QueryResult{
		Data: [][]*nulls.String{},
	}

	result.Columns, err = rows.Columns()
	if err != nil {
		return nil, err
	}
	columnTypes, err := rows.ColumnTypes()
	if err != nil {
		return nil, err
	}

	result.Types = make([]string, len(columnTypes))
	for i, t := range columnTypes {
		result.Types[i] = t.DatabaseTypeName()
	}

	i := 0
	for rows.Next() {
		r, err := rows.SliceScan()
		if err != nil {
			return nil, err
		}
		row := make([]*nulls.String, len(r))

		for i, c := range r {
			if c == nil {
				row[i] = nil
			} else {
				row[i] = nulls.NewString(string(c.([]byte)))
			}
		}

		result.Data = append(result.Data, row)

		i++
		if i > MAX_ROWS {
			result.ResultsTruncated = true
			break
		}
	}

	return result, nil
})
