FROM node:alpine

RUN mkdir -p /home/grillaClient

WORKDIR /home/grillaClient

COPY . .

RUN npm install

ENV VITE_IPCONFIG=http://localhost:4000/graphql
ENV VITE_SEATS=3
ENV VITE_THRESHOLD=0

EXPOSE 4173

CMD ["npm", "start"]