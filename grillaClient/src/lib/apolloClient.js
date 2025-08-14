import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
  from,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

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

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    }

    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  }
);

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
  from([errorLink, authLink, httpLink])
);

// Enhanced cache configuration with better type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        tables: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        persons: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        users: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        factionsConfig: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Table: {
      keyFields: ['_id'],
      fields: {
        factions: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        persons: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Person: {
      keyFields: ['_id'],
    },
    User: {
      keyFields: ['_id'],
    },
    FactionConfig: {
      keyFields: ['_id'],
    },
    Faction: {
      keyFields: ['_id'],
    },
  },
  // Persist cache to localStorage
  possibleTypes: {},
});

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  // Enable cache persistence
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
});

// Cache persistence utilities
export const persistCache = () => {
  try {
    const cacheData = apolloClient.cache.extract();
    localStorage.setItem('apollo-cache', JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to persist Apollo cache:', error);
  }
};

export const restoreCache = () => {
  try {
    const cachedData = localStorage.getItem('apollo-cache');
    if (cachedData) {
      apolloClient.cache.restore(JSON.parse(cachedData));
    }
  } catch (error) {
    console.warn('Failed to restore Apollo cache:', error);
  }
};
