package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID              uint64 `gorm:"primaryKey"`
	PublicID        string `gorm:"index"`
	FirstName       sql.NullString
	LastName        sql.NullString
	IsActive        bool
	IsAdmin         bool
	CreatedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	LastLogin       time.Time
	PictureFileName string
}
