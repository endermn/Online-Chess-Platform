package models

import (
	"time"
)

type User struct {
	ID              uint64 `gorm:"primaryKey"`
	PublicID        string `gorm:"uniqueIndex"`
	FullName        string `gorm:"not null;default:null"`
	Email           string `gorm:"not null;default:null"`
	PasswordHash    string `gorm:"not null; default:null"`
	IsActive        bool
	IsAdmin         bool
	CreatedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	LastLogin       time.Time
	PictureFileName string
}
