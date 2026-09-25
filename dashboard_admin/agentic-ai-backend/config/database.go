package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectDatabase() {
	host := "127.0.0.1"
	port := "3306"
	user := "root"
	password := ""
	database := "agentic_ai_admin"

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		user,
		password,
		host,
		port,
		database,
	)

	var err error

	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Gagal membuka koneksi database:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Gagal terhubung ke MySQL:", err)
	}

	log.Println("Database MySQL berhasil terhubung!")
}