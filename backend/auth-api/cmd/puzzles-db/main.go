package main

import (
	"bufio"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/endermn/Thesis/backend/auth-api/pkg/config"
	"github.com/klauspost/compress/zstd"
	"gorm.io/gorm"
)

// ImportPuzzlesFromZstCSV reads a Zstandard compressed CSV file and imports puzzles into the database
func ImportPuzzlesFromZstCSV(filename string) error {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := postgres.Init(cfg.DBConfig)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %v", err)
	}

	db.Exec("TRUNCATE puzzles;")

	// Open the Zstandard compressed file
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("error opening file: %v", err)
	}
	defer file.Close()

	// Create Zstandard reader
	zstdReader, err := zstd.NewReader(file)
	if err != nil {
		return fmt.Errorf("error creating zstd reader: %v", err)
	}
	defer zstdReader.Close()

	// Create a buffered reader
	reader := bufio.NewReader(zstdReader)

	// Create CSV reader
	csvReader := csv.NewReader(reader)
	csvReader.FieldsPerRecord = -1 // Allow variable number of fields

	// Prepare for batch processing
	batchSize := 1000
	puzzles := make([]models.Puzzle, 0, batchSize)
	totalImported := 0

	// Ensure the table is created
	err = db.AutoMigrate(&models.Puzzle{})
	if err != nil {
		return fmt.Errorf("auto migration failed: %v", err)
	}

	// Process line by line
	for {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Error reading record: %v", err)
			continue
		}

		// Skip header if present
		if totalImported == 0 && (record[0] == "PuzzleId" || record[0] == "puzzle_id") {
			continue
		}

		// Ensure we have enough fields
		if len(record) < 9 {
			log.Printf("Skipping incomplete record: %v", record)
			continue
		}

		// Safely parse numeric fields
		rating, err := strconv.ParseFloat(record[3], 64)
		if err != nil {
			log.Printf("Invalid rating for puzzle %s: %v", record[0], err)
			continue
		}

		ratingDeviation, err := strconv.ParseFloat(record[4], 64)
		if err != nil {
			log.Printf("Invalid rating deviation for puzzle %s: %v", record[0], err)
			continue
		}

		popularity, err := strconv.ParseFloat(record[5], 64)
		if err != nil {
			log.Printf("Invalid popularity for puzzle %s: %v", record[0], err)
			continue
		}

		nbPlays, err := strconv.ParseUint(record[5], 10, 64)
		if err != nil {
			log.Printf("Invalid number of plays for puzzle %s: %v", record[0], err)
			continue
		}

		// Split moves - first move is the first element
		moves := strings.Split(record[2], " ")
		firstMove := ""
		secondMove := ""
		if len(moves) > 0 {
			firstMove = moves[0]
			secondMove = moves[1]
		}
		log.Printf("moves: %v : %v", firstMove, secondMove)

		puzzle := models.Puzzle{
			PuzzleId:        record[0],
			FEN:             record[1],
			Moves:           models.StringArray(moves),
			FirstMove:       firstMove,
			SecondMove:      secondMove,
			Rating:          rating,
			RatingDeviation: ratingDeviation,
			Popularity:      popularity,
			NbPlays:         nbPlays,
			Themes:          models.StringArray(strings.Split(record[6], " ")),
			GameUrl:         record[7],
			OpeningTags:     models.StringArray(strings.Split(record[8], " ")),
		}

		puzzles = append(puzzles, puzzle)

		// Bulk insert in batches
		if len(puzzles) >= batchSize {
			result := db.Create(&puzzles)
			if result.Error != nil && result.Error != gorm.ErrDuplicatedKey {
				return fmt.Errorf("error inserting puzzles batch: %v", result.Error)
			}
			totalImported += len(puzzles)
			fmt.Printf("Imported %d puzzles (total: %d)\n", len(puzzles), totalImported)
			puzzles = make([]models.Puzzle, 0, batchSize)
		}
	}

	// Insert any remaining puzzles
	if len(puzzles) > 0 {
		result := db.Create(&puzzles)
		if result.Error != nil {
			return fmt.Errorf("error inserting final puzzles batch: %v", result.Error)
		}
		totalImported += len(puzzles)
		fmt.Printf("Imported final %d puzzles (total: %d)\n", len(puzzles), totalImported)
	}

	return nil
}

func main() {
	dir, _ := os.Getwd()
	filename := dir + "/puzzles/lichess_db_puzzle.csv.zst"
	err := ImportPuzzlesFromZstCSV(filename)
	if err != nil {
		log.Fatalf("Import failed: %v, current dir: %v", err, dir)
	}
}
