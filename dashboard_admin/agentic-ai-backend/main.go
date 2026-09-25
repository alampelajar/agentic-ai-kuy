package main

import (
	"log"
	"net/http"

	"agentic-ai-backend/config"
	"agentic-ai-backend/handlers"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	config.ConnectDatabase()

	mux := http.NewServeMux()

	mux.HandleFunc("/api/admin/login", handlers.AdminLogin)
	mux.HandleFunc("/api/admin/refresh", handlers.AdminRefresh)

	log.Println("Backend server berjalan di http://localhost:8080")

	err := http.ListenAndServe(":8080", enableCORS(mux))
	if err != nil {
		log.Fatal("Server gagal dijalankan:", err)
	}
}