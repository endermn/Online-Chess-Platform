package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	limit    int
	period   time.Duration
	requests map[string][]time.Time // Store timestamps of requests
	lock     sync.Mutex
}

func NewRateLimiter(limit int, period time.Duration) *RateLimiter {
	return &RateLimiter{
		limit:    limit,
		period:   period,
		requests: make(map[string][]time.Time),
	}
}

func (rl *RateLimiter) RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ipAddress := c.ClientIP()

		now := time.Now()
		cutoff := now.Add(-rl.period)

		rl.lock.Lock()
		defer rl.lock.Unlock()

		if rl.requests == nil {
			rl.requests = make(map[string][]time.Time)
		}

		// Clean expired requests
		var validRequests []time.Time
		for _, timestamp := range rl.requests[ipAddress] {
			if timestamp.After(cutoff) {
				validRequests = append(validRequests, timestamp)
			}
		}

		// Check if we're over the limit
		if len(validRequests) >= rl.limit {
			c.String(http.StatusTooManyRequests, "Too many requests. Try again in a few minutes.")
			c.Abort()
			return
		}

		rl.requests[ipAddress] = append(validRequests, now)

		c.Next()
	}
}
