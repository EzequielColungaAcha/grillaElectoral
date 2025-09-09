import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import jwt from 'jsonwebtoken';

export async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  await server.start();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb' }));
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Get the user token from the headers
        const token = req.headers.authorization || '';

        // Try to retrieve a user with the token
        let user = null;
        if (token) {
          try {
            // Decode the user from the token
            const decoded = jwt.verify(token, 'UNFASE_STRINGYFIED');
            user = {
              user_id: decoded.user_id,
              username: decoded.username,
              name: decoded.name,
              rol: decoded.rol,
            };
          } catch (err) {
            // Token is invalid, user remains null
            console.warn('Invalid token provided');
          }
        }

        // Add the user to the context
        return { user };
      },
    })
  );

  const PORT = process.env.PORT || 4000;

  await new Promise((resolve) =>
    httpServer.listen(
      {
        port: PORT,
      },
      resolve
    )
  );
  console.log(`🚀 Server ready at port ${PORT}`);
}
