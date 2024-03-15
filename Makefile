# Makefile for executing command commands related to swoops-webapp
#
# lint: update the front end api endpoints based on backend changes
# build: build docker images
# up: activate docker container that has swoops webapp
# up-d: activate docker container as daemon process
# clean: remove all docker images

lint:
	./backend/lint.py --fix
build:
	docker-compose -f docker-compose.local.yml build
up:
	docker-compose -f docker-compose.local.yml up
up-d:
	docker-compose -f docker-compose.local.yml up -d
down:
	docker-compose -f  docker-compose.local.yml down
clean:
	docker rmi -f $(docker images -aq)
attach-be:
	docker attach swoops-webapp_backend_1
