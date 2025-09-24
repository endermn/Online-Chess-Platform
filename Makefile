ifneq (,$(wildcard .env))
	include .env
	export $(shell sed 's/=.*//' .env)
endif

run_server: 
	cd backend && export PEM_KEY="-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEICIVAwm2aAa1ldiIbMU8I3X8HjRj25DkoUneR8uHdS7UoAoGCCqGSM49\nAwEHoUQDQgAEdkqhLFaY/cKaONTDMP8pcWrE/Rm/9Fmcfc+cd/BKAMBOprXAT6WB\n0vtzv8+XatsBwC/SEsupPylVPwf4KMKTGQ==\n-----END EC PRIVATE KEY-----" && go run auth-api/cmd/http-server/main.go
run_puzzles:
	cd backend && go run auth-api/cmd/puzzles-db/main.go
run_news:
	cd backend && go run auth-api/cmd/news-import/main.go
# run with make run_server