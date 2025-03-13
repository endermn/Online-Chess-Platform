package postgres_test

import (
	"fmt"
	"log"
	"testing"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	ps "github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func TestDBSetup(t *testing.T) {

	config := ps.Config{
		User:     "postgres",
		Password: "4294",
		Addr:     "localhost:5432",
		DBName:   "test_db",
	}

	connStr := fmt.Sprintf(
		"postgres://%s:%s@%s/%s?sslmode=disable",
		config.User,
		config.Password,
		config.Addr,
		config.DBName,
	)
	var err error
	DB, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to database %s on address %s: %s", config.DBName, config.Addr, err)
	}

	err = models.MigrateGames(DB)
	if err != nil {
		t.Fatalf("Failed to migrate games: %s", err)
	}

	err = DB.AutoMigrate(&models.User{}, &models.Statistic{}, &models.News{})
	if err != nil {
		t.Fatalf("Auto migration failed: %v", err)
	}
	log.Printf("Successfully connected to db")
	var dbName string
	err = DB.Raw("SELECT current_database()").Scan(&dbName).Error
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to database:", dbName)
}
