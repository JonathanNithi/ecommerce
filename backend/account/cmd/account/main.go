package main

import (
	"log"
	"time"

	"github.com/JonathanNithi/ecommerce/account"
	"github.com/kelseyhightower/envconfig"
	"github.com/tinrab/retry"
)

type Config struct {
	DatabaseURL string `envconfig:"DATABASE_URL"`
}

func main() {
	var cfg Config
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatal(err)
	}

	var r account.Repository
	retry.ForeverSleep(2*time.Second, func(_ int) (err error) {
		//Connected to database
		account.NewPostgresRepository(cfg.DatabaseURL)
		if err != nil {
			log.Println(err)
		}
		return
	})
	defer r.Close()
	//started GRPC server
	log.Println("Listening on port 8080.....")
	s := account.NewService(r)
	log.Fatal(account.ListenGRPC(s, 8080))
}
