package postgres

import (
	"fmt"
	"log"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

type Config struct {
	User     string
	Password string
	Addr     string
	DBName   string
}

// Init initializes the global PostgreSQL database connection using GORM and applies schema migrations.
//
// It constructs a connection string from the provided configuration and attempts to open the database connection.
// Upon a successful connection, it runs game-specific migrations via models.MigrateGames and auto-migrates the
// User, Statistic, and News models. Errors encountered during any step are logged and returned.
func Init(config Config) error {
	connStr := fmt.Sprintf(
		"postgres://%s:%s@%s/%s?sslmode=disable",
		config.User,
		config.Password,
		config.Addr,
		config.DBName,
	)
	DB, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		log.Printf("Failed to connect to database %s on address %s: %s", config.DBName, config.Addr, err)
		return err
	}

	err = models.MigrateGames(DB)
	if err != nil {
		log.Printf("Failed to migrate games: %s", err)
		return err
	}

	err = DB.AutoMigrate(&models.User{}, &models.Statistic{}, &models.News{})
	if err != nil {
		log.Printf("Auto migration failed: %v", err)
		return err
	}

	return nil
}
