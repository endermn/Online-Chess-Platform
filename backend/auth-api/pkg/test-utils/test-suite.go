package testutils

import (
	"io"
	"net/http"
	"net/http/httptest"
)

func NewRequest(method, target string, body io.Reader) *http.Request {
	req := httptest.NewRequest(method, target, body)
	req.Header.Set("Content-type", "application/json")

	return req
}
