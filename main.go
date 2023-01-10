package main

import (
	"log"
	"net/http"

	"github.com/abibby/beam/config"
	"github.com/abibby/beam/controller"
	"github.com/abibby/beam/fileserver"
	"github.com/abibby/beam/ui"
	"github.com/gorilla/mux"
)

func main() {
	config.Load("./config.json")

	r := mux.NewRouter()
	r.PathPrefix("/").
		Handler(fileserver.WithFallback(ui.Content, "dist", "index.html", nil)).
		Methods("GET")
	r.Handle("/query", controller.Query).Methods("POST")

	log.Print("listening at http://localhost:22166")
	http.ListenAndServe(":22166", r)
}
