package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"agentic-ai-backend/config"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const jwtSecret = "admin-dashboard-development-secret"

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type AdminUser struct {
	ID       uint
	Name     string
	Email    string
	Password string
	Role     string
	Status   string
}

type LoginResponse struct {
	Message      string `json:"message"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         struct {
		ID     uint   `json:"id"`
		Name   string `json:"name"`
		Email  string `json:"email"`
		Role   string `json:"role"`
		Status string `json:"status"`
	} `json:"user"`
}

type RefreshResponse struct {
	Message     string `json:"message"`
	AccessToken string `json:"access_token"`
}

func AdminLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request LoginRequest

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Format request tidak valid", http.StatusBadRequest)
		return
	}

	email := strings.TrimSpace(strings.ToLower(request.Email))

	if email == "" || request.Password == "" {
		http.Error(w, "Email dan password wajib diisi", http.StatusBadRequest)
		return
	}

	var admin AdminUser

	err = config.DB.QueryRow(`
		SELECT id, name, email, password, role, status
		FROM admin_users
		WHERE email = ?
		LIMIT 1
	`, email).Scan(
		&admin.ID,
		&admin.Name,
		&admin.Email,
		&admin.Password,
		&admin.Role,
		&admin.Status,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	if err != nil {
		http.Error(w, "Terjadi kesalahan database", http.StatusInternalServerError)
		return
	}

	if admin.Status != "Active" {
		http.Error(w, "Akun admin tidak aktif", http.StatusForbidden)
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(admin.Password),
		[]byte(request.Password),
	)

	if err != nil {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	// Access token berlaku 15 menit.
	accessToken, err := generateAccessToken(
		admin.ID,
		admin.Email,
		admin.Role,
	)

	if err != nil {
		http.Error(w, "Gagal membuat access token", http.StatusInternalServerError)
		return
	}

	// Refresh token berlaku 7 hari.
	refreshToken, err := generateRefreshToken(
		admin.ID,
		admin.Email,
		admin.Role,
	)

	if err != nil {
		http.Error(w, "Gagal membuat refresh token", http.StatusInternalServerError)
		return
	}

	var response LoginResponse

	response.Message = "Login berhasil"
	response.AccessToken = accessToken
	response.RefreshToken = refreshToken

	response.User.ID = admin.ID
	response.User.Name = admin.Name
	response.User.Email = admin.Email
	response.User.Role = admin.Role
	response.User.Status = admin.Status

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(response)
}

func AdminRefresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request RefreshRequest

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Format request tidak valid", http.StatusBadRequest)
		return
	}

	refreshToken := strings.TrimSpace(request.RefreshToken)

	if refreshToken == "" {
		http.Error(w, "Refresh token wajib diisi", http.StatusBadRequest)
		return
	}

	token, err := jwt.Parse(
		refreshToken,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, jwt.ErrSignatureInvalid
			}

			return []byte(jwtSecret), nil
		},
	)

	if err != nil || !token.Valid {
		http.Error(
			w,
			"Refresh token tidak valid atau sudah expired",
			http.StatusUnauthorized,
		)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Token tidak valid", http.StatusUnauthorized)
		return
	}

	tokenType, exists := claims["token_type"]
	if !exists || tokenType != "refresh" {
		http.Error(w, "Token bukan refresh token", http.StatusUnauthorized)
		return
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Data user pada token tidak valid", http.StatusUnauthorized)
		return
	}

	userID := uint(userIDFloat)

	var admin AdminUser

	err = config.DB.QueryRow(`
		SELECT id, name, email, password, role, status
		FROM admin_users
		WHERE id = ?
		LIMIT 1
	`, userID).Scan(
		&admin.ID,
		&admin.Name,
		&admin.Email,
		&admin.Password,
		&admin.Role,
		&admin.Status,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Admin tidak ditemukan", http.StatusUnauthorized)
		return
	}

	if err != nil {
		http.Error(w, "Terjadi kesalahan database", http.StatusInternalServerError)
		return
	}

	if admin.Status != "Active" {
		http.Error(w, "Akun admin tidak aktif", http.StatusForbidden)
		return
	}

	accessToken, err := generateAccessToken(
		admin.ID,
		admin.Email,
		admin.Role,
	)

	if err != nil {
		http.Error(w, "Gagal membuat access token", http.StatusInternalServerError)
		return
	}

	response := RefreshResponse{
		Message:     "Access token berhasil diperbarui",
		AccessToken: accessToken,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(response)
}

func generateAccessToken(
	userID uint,
	email string,
	role string,
) (string, error) {
	return generateTokenWithType(
		userID,
		email,
		role,
		15*time.Minute,
		"access",
	)
}

func generateRefreshToken(
	userID uint,
	email string,
	role string,
) (string, error) {
	return generateTokenWithType(
		userID,
		email,
		role,
		7*24*time.Hour,
		"refresh",
	)
}

func generateToken(
	userID uint,
	email string,
	role string,
	duration time.Duration,
) (string, error) {
	return generateTokenWithType(
		userID,
		email,
		role,
		duration,
		"access",
	)
}

func generateTokenWithType(
	userID uint,
	email string,
	role string,
	duration time.Duration,
	tokenType string,
) (string, error) {
	claims := jwt.MapClaims{
		"user_id":    userID,
		"email":      email,
		"role":       role,
		"token_type": tokenType,
		"exp":        time.Now().Add(duration).Unix(),
		"iat":        time.Now().Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	return token.SignedString([]byte(jwtSecret))
}