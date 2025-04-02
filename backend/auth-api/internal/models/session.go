package models

type Session struct {
	ID     uint64 `gorm:"primaryKey"`
	GameID uint64 `gorm:"index"`

	Game Game `gorm:"foreignKey:GameID;OnDelete:CASCADE"`
}
