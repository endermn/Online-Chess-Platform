package models

import (
	"database/sql/driver"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// StringArray is a custom type to handle string slices in PostgreSQL
type StringArray []string

// Value converts the StringArray to a database-compatible value
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "{}", nil
	}
	// Escape single quotes and wrap each element in quotes
	escapedItems := make([]string, len(a))
	for i, item := range a {
		escapedItems[i] = `"` + strings.ReplaceAll(item, `"`, `""`) + `"`
	}
	return "{" + strings.Join(escapedItems, ",") + "}", nil
}

// Scan converts the database value back to a StringArray
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}

	var str string
	switch v := value.(type) {
	case []byte:
		str = string(v)
	case string:
		str = v
	default:
		return errors.New("invalid type for StringArray")
	}

	// Remove curly braces and split
	str = strings.Trim(str, "{}")
	if str == "" {
		*a = nil
		return nil
	}

	// Split and unescape
	items := strings.Split(str, ",")
	result := make(StringArray, len(items))
	for i, item := range items {
		// Remove surrounding quotes and unescape
		item = strings.Trim(item, `"`)
		item = strings.ReplaceAll(item, `""`, `"`)
		result[i] = item
	}
	*a = result
	return nil
}

// Puzzle struct with custom array handling for PostgreSQL
type Puzzle struct {
	PuzzleId        string      `gorm:"column:puzzle_id;primaryKey"`
	FEN             string      `gorm:"column:fen"`
	Moves           StringArray `gorm:"column:moves;type:text[]"`
	FirstMove       string      `gorm:"column:first_move"`
	SecondMove      string      `gorm:"column:second_move"`
	Rating          float64     `gorm:"column:rating"`
	RatingDeviation float64     `gorm:"column:rating_deviation"`
	Popularity      float64     `gorm:"column:popularity"`
	NbPlays         uint64      `gorm:"column:nb_plays"`
	Themes          StringArray `gorm:"column:themes;type:text[]"`
	GameUrl         string      `gorm:"column:game_url"`
	OpeningTags     StringArray `gorm:"column:opening_tags;type:text[]"`
}

// BeforeCreate is a GORM hook to handle slice conversion before creating a record
func (p *Puzzle) BeforeCreate(tx *gorm.DB) (err error) {
	// Ensure empty slices are converted to empty arrays
	if p.Moves == nil {
		p.Moves = StringArray{}
	}
	if p.Themes == nil {
		p.Themes = StringArray{}
	}
	if p.OpeningTags == nil {
		p.OpeningTags = StringArray{}
	}
	return
}
