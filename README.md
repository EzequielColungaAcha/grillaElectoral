# Grilla Electoral

## To Do

- Logs

## .env

```env
# Client URL
CLIENT=https://X.grillaelectoral.com
# Client URL Port, only localhost. Deploy use NGINX Proxy
CLIENT_PORT=8000
# Server URL
IPCONFIG=https://X.server.grillaelectoral.com
# Server URL Port, only localhost. Deploy use NGINX Proxy
SERVER_PORT=4008
# Seats renew (cantidad de Concejales a renovar)
SEATS=3
# Threshold que se utiliza en las paso para saber si una lista no va a generales.
THRESHOLD=0
```

## docker-compose.yml

```yaml
version: "3.8"
services:
  client:
    build: ./grillaClient/.
    ports:
      - ${CLIENT_PORT}:4173
    environment:
      - VITE_IPCONFIG=${IPCONFIG}/graphql
      - VITE_SEATS=${SEATS}
      - VITE_THRESHOLD=${THRESHOLD}
  server:
    build: ./grillaServer/.
    ports:
      - ${SERVER_PORT}:4000
    links:
      - monguito
    environment:
      - MONGODB_URI=mongodb://ezziel:fawst@monguito:27017
  monguito:
    image: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=ezziel
      - MONGO_INITDB_ROOT_PASSWORD=fawst
```

## Docker create

- Network

  - Primero creamos la red con `docker network create ciudad`

- Client

  - docker create -p 80:4173 --name client --network _ciudad_ -e VITE*IPCONFIG=\_IP_A_LA_QUE_APUNTE*/graphql -e VITE*EXPORT=\_IP_A_LA_QUE_APUNTE* ezziel/grilla:client

- Server

  - docker create -p 4000:4000 --name server --network _ciudad_ -e MONGODB*URI=\_URI_A_LA_QUE_APUNTE* ezziel/grilla:server

- Mongo

  - docker create --name monguito --network _ciudad_ -e MONGO*INITDB_ROOT_USERNAME=\_USER* -e MONGO*INITDB_ROOT_PASSWORD=\_PASSWORD* mongo

## ENV

- Client

  - VITE_IPCONFIG: por defecto http://localhost:4000/graphql, colocar la IP que apunte al servidor.

  - VITE*EXPORT: por defecto http://localhost:3000, colocar la IP del \_servidor* para exportar.

- Server

  - NODE_ENV: por defecto "production", esto evita que se muestre el playground de Graphql. Colocar cualquier otra cosa si se quiere habilitar el playground.

  - MONGODB_URI: por defecto "mongodb://ezziel:fawst@monguito:27017", colocar la dirección que apunte a la base de datos de mongo.
    Ejemplo de URI: mongodb://USER:PASSWORD@CONTAINER_NAME:PORT

- Mongo

  - MONGO_INITDB_ROOT_USERNAME: dar un nombre de usuario a la base de datos, ejemplo mongodb://**_ezziel_**:fawst@monguito:27017

  - MONGO_INITDB_ROOT_PASSWORD: dar una contraseña a la base de datos, ejemplo mongodb://ezziel:**_fawst_**@monguito:27017
