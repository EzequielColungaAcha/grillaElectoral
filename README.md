# Grilla Electoral

Esta aplicación es utilizada para hacer seguimiento de los sufragios y las actividades que conlleva una elección.
Está pensada para ser utilizada por fiscales, prensa, usuarios en las HQ de cada partido y administradores.
Cada usuario tiene su rol, lo que dará acceso a diferentes partes de la aplicación.

Para lograr deployarla se recomienda tener un servidor con Nginx para hacer reverse proxy.
En una instancia se puede deployar solo este compose que contiene cliente, servidor y base de datos.
El cliente es lo único expuesto al exterior, ya que la api recibe los request por la url del cliente y la base de datos se conecta internamente con la api.

## docker-compose.yml

```yaml
services:
  client:
    build:
      context: ./grillaClient
      args:
        VITE_SEATS: ${SEATS}
        VITE_THRESHOLD: ${THRESHOLD}
        VITE_HASH_BROWSER: ${HASH_BROWSER}
    ports:
      - '${CLIENT_PORT}:80'
    depends_on:
      - server

  server:
    build: ./grillaServer
    expose:
      - '4000'
    environment:
      - MONGODB_URI=mongodb://ezziel:fawst@monguito:27017
      - NODE_ENV=production
    depends_on:
      - monguito

  monguito:
    image: mongo:latest
    environment:
      - MONGO_INITDB_ROOT_USERNAME=ezziel
      - MONGO_INITDB_ROOT_PASSWORD=fawst
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## .env

```env
# CITY indica la ciudad de la URL que usara la app.
CITY=X

# Production

# Client URL Production
CLIENT=https://${CITY}.grillaelectoral.com
# Client Port Production
CLIENT_PORT=80
# Server URL Production
IPCONFIG=https://${CITY}.server.grillaelectoral.com


#Development

# Client URL Development
# CLIENT=http://localhost
# Client Port Development
# CLIENT_PORT=8000
# Server URL Development
# IPCONFIG=http://localhost:8000

# ---------------------------

# Server URL Port, only localhost. Deploy use NGINX Proxy
SERVER_PORT=8000

# Seats renew (cantidad de Concejales a renovar)
SEATS=3

# Threshold que se utiliza en las paso para saber si una lista no va a generales.
THRESHOLD=0

# Used by react-router to know if the browser should use '#/' or '/' in the URL. If true it will use '#/'.
HASH_BROWSER=false
```
