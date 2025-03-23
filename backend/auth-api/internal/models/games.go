package models

import (
	"gorm.io/gorm"
)

// ENUM types
const (
	OpponentTypeBot  = "BOT"
	OpponentTypeUser = "USER"

	GameStatusInProgress = "IN_PROGRESS"
	GameStatusFinished   = "FINISHED"

	GameStateWin     = "WIN"
	GameStateFailure = "FAILURE"
	GameStateDraw    = "DRAW"
)

type Game struct {
	ID             uint64 `gorm:"primaryKey"`
	PublicID       uint64 `gorm:"uniqueIndex"`
	UserID         uint64 `gorm:"not null"`
	OpponentType   string `gorm:"type:opponent_type;not null"`
	OpponentUserID uint64
	GameStatus     string `gorm:"type:game_status;not null"`
	GameState      string `gorm:"type:game_state;not null"`
	// GameType       string `gorm:"type:game_type;not null"`
	GamePoints int `gorm:"not null;check:game_points > 0"`

	User User `gorm:"foreignKey:UserID"`
}

func MigrateGames(db *gorm.DB) error {
	// Create enums if they do not exist
	if err := db.Exec(`DO $$
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opponent_type') THEN
			CREATE TYPE opponent_type AS ENUM ('BOT', 'USER');
		END IF;
	END
	$$;`).Error; err != nil {
		return err
	}

	if err := db.Exec(`DO $$
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
			CREATE TYPE game_status AS ENUM ('IN_PROGRESS', 'FINISHED');
		END IF;
	END
	$$;`).Error; err != nil {
		return err
	}

	if err := db.Exec(`DO $$
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_state') THEN
			CREATE TYPE game_state AS ENUM ('WIN', 'FAILURE', 'DRAW');
		END IF;
	END
	$$;`).Error; err != nil {
		return err
	}

	// if err := db.Exec(`DO $$
	// BEGIN
	// 	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_type') THEN
	// 		CREATE TYPE game_type AS ENUM ('TYPE1', 'TYPE2', 'TYPE3');
	// 	END IF;
	// END
	// $$;`).Error; err != nil {
	// 	return err
	// }

	return db.AutoMigrate(&Game{})
}
