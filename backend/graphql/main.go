package main

import (
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/99designs/gqlgen/handler"
	"github.com/kelseyhightower/envconfig"
)

// AppConfig struct for storing environment variables
type AppConfig struct {
	AccountURL string `envconfig:"ACCOUNT_SERVICE_URL"`
	CatalogURL string `envconfig:"CATALOG_SERVICE_URL"`
	OrderURL   string `envconfig:"ORDER_SERVICE_URL"`
}

func main() {
	var cfg AppConfig
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatal(err)
	}

	// Create your GraphQL server (assuming NewGraphQLServer is defined)
	s, err := NewGraphQLServer(cfg.AccountURL, cfg.CatalogURL, cfg.OrderURL)
	if err != nil {
		log.Fatal(err)
	}

	// Set up the routes
	http.Handle("/graphql", handler.GraphQL(s.ToExecutableSchema()))
	http.Handle("/playground", playground.Handler("Playground", "/graphql"))

	// Start the server on port 8080
	log.Fatal(http.ListenAndServe(":8080", nil))
}
