import React from 'react';
import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Tables } from './pages/Tables.jsx';
import { TableDetails } from './pages/TableDetails.jsx';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  split,
  HttpLink,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { Base } from './pages/Base.jsx';
import { Prensa } from './pages/Prensa.jsx';
import { AdminTableDetails } from './pages/AdminTableDetails.jsx';
import { Login } from '../src/components/login/Login.jsx';
import { AuthProvider } from './context/authContext.jsx';
import { setContext } from '@apollo/client/link/context';
import Navbar from './components/navbar/Navbar.jsx';
import { ProtectedRoute } from './components/protectedRoute/ProtectedRoute.jsx';
import { PRIVACY } from './config.js';
import { Home } from './pages/Home.jsx';
import { Register } from './pages/Register.jsx';
import { Logout } from './pages/Logout.jsx';
import { AdminTables } from './pages/AdminTables.jsx';
import { AdminFactions } from './pages/AdminFactions.jsx';
import { AdminUsers } from './pages/AdminUsers.jsx';
import { Export } from './pages/Export.jsx';
import { Estado } from './pages/Estado.jsx';
import { Escrutinio } from './pages/Escrutinio.jsx';

// const MONGODB_URI = import.meta.env.VITE_IPCONFIG
const MONGODB_URI = import.meta.env.VITE_IPCONFIG;
const MONGODB_URI_WS = MONGODB_URI.replace('http', 'ws');

const httpLink = new HttpLink({
  uri: MONGODB_URI,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: localStorage.getItem('token') || '',
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: MONGODB_URI_WS,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Table: {
        fields: {
          factions: {
            merge(existing = [], incoming) {
              return [...incoming];
            },
          },
        },
      },
    },
  }),
});
const routerHandler_HashTrue_BrowserFalse = import.meta.env.VITE_HASH_BROWSER;

export const App = () => {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        {routerHandler_HashTrue_BrowserFalse === true ? (
          <HashRouter>
            <Navbar></Navbar>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route
                path='/'
                element={
                  <ProtectedRoute privacy={PRIVACY.all}>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/logout'
                element={
                  <ProtectedRoute privacy={PRIVACY.everyone}>
                    <Logout />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mesas'
                element={
                  <ProtectedRoute privacy={PRIVACY.mesas}>
                    <Tables />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mesas/:id'
                element={
                  <ProtectedRoute privacy={PRIVACY.mesas}>
                    <TableDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/base'
                element={
                  <ProtectedRoute privacy={PRIVACY.base}>
                    <Base />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/estado'
                element={
                  <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                    <Estado />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/escrutinio'
                element={
                  <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                    <Escrutinio />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/prensa'
                element={
                  <ProtectedRoute privacy={PRIVACY.prensa}>
                    <Prensa />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/tables/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminTables />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/tables/:id'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminTableDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/partidos/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminFactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/usuarios/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/exportar/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <Export />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </HashRouter>
        ) : (
          <BrowserRouter>
            <Navbar></Navbar>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route
                path='/'
                element={
                  <ProtectedRoute privacy={PRIVACY.all}>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/logout'
                element={
                  <ProtectedRoute privacy={PRIVACY.everyone}>
                    <Logout />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mesas'
                element={
                  <ProtectedRoute privacy={PRIVACY.mesas}>
                    <Tables />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mesas/:id'
                element={
                  <ProtectedRoute privacy={PRIVACY.mesas}>
                    <TableDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/base'
                element={
                  <ProtectedRoute privacy={PRIVACY.base}>
                    <Base />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/estado'
                element={
                  <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                    <Estado />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/escrutinio'
                element={
                  <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                    <Escrutinio />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/prensa'
                element={
                  <ProtectedRoute privacy={PRIVACY.prensa}>
                    <Prensa />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/tables/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminTables />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/tables/:id'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminTableDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/partidos/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminFactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/usuarios/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/exportar/'
                element={
                  <ProtectedRoute privacy={PRIVACY.admin}>
                    <Export />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        )}
      </ApolloProvider>
    </AuthProvider>
  );
};
