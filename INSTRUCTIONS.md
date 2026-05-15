# Instrucciones de Uso - DentiEstefy (macOS)

Este documento proporciona los comandos necesarios para gestionar el proyecto en tu Mac.

## Requisitos Previos

- **Node.js**: v22.18.0 (gestionado vía NVM).
- **Terminal**: iTerm2, Terminal.app o la terminal integrada de VS Code.

## Configuración del PATH (Importante)
Como tu instalación de Node está en una ruta específica de NVM, si la terminal no reconoce `npm` o `node`, ejecuta esto primero:
```bash
export PATH="/Users/fosorio/.nvm/versions/node/v22.18.0/bin:$PATH"
```

---

## Comandos Principales

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Ejecutar el Proyecto (Localhost)
Para iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación se abrirá en: [http://localhost:5173/](http://localhost:5173/)

### 3. Detener el Proyecto
Para cerrar el servidor que está corriendo:

1.  **Método Estándar**: En la misma ventana de la terminal donde lo ejecutaste, presiona:
    `Control + C` (esto detiene el proceso de inmediato).

2.  **Si la terminal se quedó "pegada" o el puerto sigue ocupado**:
    Si por alguna razón el servidor sigue activo y no puedes usar la terminal anterior, ejecuta este comando para forzar el cierre del puerto 5173:
    ```bash
    kill -9 $(lsof -t -i:5173)
    ```

---

## Otros Comandos

### Construir para Producción
```bash
npm run build
```

### Probar la versión de Producción
```bash
npm run preview
```

---

## Comandos Docker y Makefile

Si prefieres correr el proyecto usando Docker, asegúrate de tener la aplicación **Docker Desktop** abierta y ejecutándose en tu Mac.

### Construir la imagen de Docker
Este comando crea la imagen `dentiestefy-app`:
```bash
make build dentiestefy
```
*(Si da error de daemon, abre la app de Docker Desktop primero).*

### Levantar el contenedor
Esto inicia la app en el puerto `5173`:
```bash
make run dentiestefy
```

### Detener el contenedor
Para detener la app en ejecución:
```bash
make stop dentiestefy
```

### Limpiar imágenes
Si necesitas borrar la imagen construida de Docker para liberar espacio:
```bash
make clean dentiestefy
```
