package database

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
	migrate "github.com/rubenv/sql-migrate"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open("sqlite3", "./data/social-network.db")
	if err != nil {
		return err
	}

	_, err = DB.Exec(`
        PRAGMA foreign_keys = ON
    `)
	if err != nil {
		return err
	}

	err = applyMigrations()
	if err != nil {
		return err
	}

	return CreateCategories()
}

func applyMigrations() error {
	m := &migrate.FileMigrationSource{
		Dir: "./migrations",
	}

	_, err := migrate.Exec(DB, "sqlite3", m, migrate.Up)
	if err != nil {
		log.Printf("Error applying migrations: %v", err)
		return err
	}
	log.Println("Migrations applied successfully!")
	return nil
}
