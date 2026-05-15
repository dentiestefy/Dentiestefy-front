.PHONY: build run stop clean logs dentiestefy

IMAGE_NAME = dentiestefy-app
CONTAINER_NAME = dentiestefy-container
PORT = 5173

# Objetivo vacío para permitir que comandos como "make build dentiestefy"
# no devuelvan un error por el segundo argumento "dentiestefy"
dentiestefy:
	@:

# Construir la imagen de Docker
build:
	docker build -t $(IMAGE_NAME) .

# Correr el contenedor (construye la imagen primero si es necesario)
run: build
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker run -d \
		-p $(PORT):$(PORT) \
		--name $(CONTAINER_NAME) \
		-v "$(PWD)/src:/app/src" \
		-v "$(PWD)/public:/app/public" \
		$(IMAGE_NAME)
	@echo "El proyecto está corriendo en http://localhost:$(PORT)"

# Detener y eliminar el contenedor
stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Ver los logs del contenedor
logs:
	docker logs -f $(CONTAINER_NAME)

# Limpiar la imagen creada
clean: stop
	docker rmi $(IMAGE_NAME) || true
