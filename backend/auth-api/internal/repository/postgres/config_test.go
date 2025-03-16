package postgres_test

import (
	"testing"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	ps "github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	_ "github.com/lib/pq"
)

const (
	OpponentTypeBot  = "BOT"
	OpponentTypeUser = "USER"

	GameStatusInProgress = "IN_PROGRESS"
	GameStatusFinished   = "FINISHED"

	GameStateWin     = "WIN"
	GameStateFailure = "FAILURE"
	GameStateDraw    = "DRAW"
)

func TestDBSetup(t *testing.T) {
	config := ps.Config{
		User:     "postgres",
		Password: "4294",
		Addr:     "localhost:5432",
		DBName:   "test_db",
	}

	db, err := ps.Init(config)
	if err != nil {
		t.Fatalf("Failed to connect to database: %s", err)
	}

	db.Exec("TRUNCATE games, statistics, users, news;")

	t.Run("Create User", func(t *testing.T) {
		testUser := models.User{
			Email:        "test@example.com",
			FullName:     "Test User",
			PasswordHash: "hashedpassword",
		}

		err = db.Create(&testUser).Error
		if err != nil {
			t.Fatalf("Failed to create User: %v", err)
		}

		var count int64
		db.Model(&models.User{}).Where("email = ?", testUser.Email).Count(&count)
		if count != 1 {
			t.Fatalf("Expected 1 user, found %d", count)
		}

		t.Run("Create Statistics", func(t *testing.T) {
			testStats := models.Statistic{
				BulletRating:    1000,
				BlitzRating:     150,
				ClassicalRating: 1000,
				RapidRating:     1500,
				TotalGames:      100,
				GamesWon:        10,
				GamesLost:       90,
				UserID:          testUser.ID,
			}

			err = db.Create(&testStats).Error
			if err != nil {
				t.Fatalf("Failed to create Statistics: %v", err)
			}

			var foundStats models.Statistic
			result := db.Where("user_id = ?", testUser.ID).First(&foundStats)
			if result.Error != nil {
				t.Fatalf("Failed to find created statistics: %v", result.Error)
			}
		})

		t.Run("Create Game", func(t *testing.T) {
			testGame := models.Game{
				UserID:         testUser.ID,
				OpponentType:   OpponentTypeBot,
				OpponentUserID: 0,
				GameStatus:     GameStatusFinished,
				GameState:      GameStateFailure,
				GamePoints:     10,
			}

			err = db.Create(&testGame).Error
			if err != nil {
				t.Fatalf("Failed to create Game: %v", err)
			}

			var count int64
			db.Model(&models.Game{}).Where("user_id = ?", testUser.ID).Count(&count)
			if count != 1 {
				t.Fatalf("Expected 1 game, found %d", count)
			}
		})
	})

	t.Run("Create News", func(t *testing.T) {
		testNews := models.News{
			Title:    "Pesho",
			Author:   "Tosho",
			Contents: "asopdkasopdkas",
		}

		err = db.Create(&testNews).Error
		if err != nil {
			t.Fatalf("Failed to create News: %v", err)
		}

		var count int64
		db.Model(&models.News{}).Where("title = ?", testNews.Title).Count(&count)
		if count != 1 {
			t.Fatalf("Expected 1 news article, found %d", count)
		}
	})
}
