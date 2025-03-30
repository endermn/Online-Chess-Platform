package middleware

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/pkg/config"
	"github.com/golang-jwt/jwt/v5"
)

func ExtractJWTPayload(tokenString string) (map[string]interface{}, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}

	var claims map[string]interface{}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, err
	}

	return claims, nil
}

func VerifyToken(tokenString string) error {
	keyString := config.GetEnv("PEM_KEY")
	privateKeyPEM := []byte(strings.ReplaceAll(keyString, "\\n", "\n"))
	privateKey, err := jwt.ParseECPrivateKeyFromPEM(privateKeyPEM)
	if err != nil {
		return err
	}
	publicKey := &privateKey.PublicKey

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodECDSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return publicKey, nil
	})
	if err != nil {
		return err
	}

	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	return nil
}

func CreateToken(user models.User) (string, error) {
	keyString := config.GetEnv("PEM_KEY")
	privateKeyPEM := []byte(strings.ReplaceAll(keyString, "\\n", "\n"))

	key, err := jwt.ParseECPrivateKeyFromPEM(privateKeyPEM)
	if err != nil {
		log.Printf("Failed while parsing token")
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodES256,
		jwt.MapClaims{
			"email":  user.Email,
			"userID": user.ID,
			"exp":    time.Now().Add(time.Hour * 24).Unix(),
		})

	tokenString, err := token.SignedString(key)
	if err != nil {
		log.Printf("Failed while generating token: %s", err)
		return "", err
	}

	return tokenString, nil
}
