ifneq (,$(wildcard .env))
	include .env
	export $(shell sed 's/=.*//' .env)
endif

run_server: 
	cd backend && go run auth-api/cmd/http-server/main.go
run_puzzles:
	cd backend && go run auth-api/cmd/puzzles-db/main.go
# run with make run_server