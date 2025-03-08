package models

type News struct {
	ID       uint64 `gorm:"primaryKey"`
	PublicID uint64 `gorm:"index"`
	Title    string
}
