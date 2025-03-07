package models

type User struct {
	ID       uint64 `gorm:"primaryKey"`
	PublicID string `gorm:"index"`
}
