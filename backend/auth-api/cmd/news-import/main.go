package main

import (
	"log"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/endermn/Thesis/backend/auth-api/pkg/config"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := postgres.Init(cfg.DBConfig)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	// Insert sample data
	insertSampleData(db)
}

func insertSampleData(db *gorm.DB) {
	news := []models.News{
		{
			PublicID:        1001,
			Title:           "Tech Breakthrough Announced",
			Author:          "Alice Johnson",
			Contents:        "A major technological advancement was unveiled today...",
			PictureFileName: "tech_breakthrough.jpg",
		},
		{
			PublicID:        1002,
			Title:           "Local Sports Team Wins Championship",
			Author:          "Bob Williams",
			Contents:        "The local sports team celebrated their championship victory...",
			PictureFileName: "sports_victory.png",
		},
		{
			PublicID:        1003,
			Title:           "Weather Alert Issued",
			Author:          "Carol Davis",
			Contents:        "A severe weather alert has been issued for the region...",
			PictureFileName: "weather_alert.jpeg",
		},
		{
			PublicID:        1004,
			Title:           "New Community Garden Opens",
			Author:          "David Rodriguez",
			Contents:        "The city's new community garden opened its doors...",
			PictureFileName: "garden.jpg",
		},
		{
			PublicID:        1005,
			Title:           "Stock Market Update",
			Author:          "Eve Martinez",
			Contents:        "Stock market sees significant fluctuations...",
			PictureFileName: "stock_market.png",
		},
	}

	for _, article := range news {
		result := db.Create(&article)
		if result.Error != nil {
			log.Printf("Failed to insert news article: %v", result.Error)
		} else {
			log.Printf("Inserted news article with ID: %d", article.ID)
		}
	}

	log.Println("Sample news data insertion completed.")
}
