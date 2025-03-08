package models

type Statistic struct {
	ID              uint64 `gorm:"primaryKey"`
	BulletRating    int
	BlitzRating     int
	RapidRating     int
	ClassicalRating int
	TotalGames      int
	GamesWon        int
	GamesLost       int
	UserID          uint64

	Statistic User `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}
