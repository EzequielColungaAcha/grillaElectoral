FROM node:alpine

RUN mkdir -p /home/grillaServer

WORKDIR /home/grillaServer

COPY . .

RUN pnpm install

EXPOSE 4000

ENV MONGODB_URI="mongodb://ezziel:fawst@monguito:27017"
ENV NODE_ENV="production"

CMD ["node", "/home/grillaServer/server/index.js"]