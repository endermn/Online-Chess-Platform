package middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var key *ecdsa.PrivateKey

func GenerateKey() {
	k, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Printf("Issue while generating key")
	}
	key = k
}

func VerifyToken(tokenString string) error {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return key, nil
	})
	if err != nil {
		return err
	}

	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	return nil
}

func CreateToken(email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodES256,
		jwt.MapClaims{
			"username": email,
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		})

	tokenString, err := token.SignedString(key)
	if err != nil {
		log.Printf("Failed while generating token: %s", err)
		return "", err
	}

	return tokenString, nil
}
