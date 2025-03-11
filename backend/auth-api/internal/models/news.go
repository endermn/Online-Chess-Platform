package models

type News struct {
	ID              uint64 `gorm:"primaryKey"`
	PublicID        uint64 `gorm:"index"`
	Title           string `gorm:"not null"`
	Author          string `gorm:"not null"`
	Contents        string `gorm:"not null"`
	PictureFileName string
}
