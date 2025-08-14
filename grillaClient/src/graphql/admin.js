import { gql } from '@apollo/client';

export const adminQuery = gql`
  query adminQuery {
    factionsConfig {
      _id
      name
      color
      position
    }
    tables {
      _id
      number
      description
      status
      voted
      totalPersons
      persons {
        _id
        order
        firstName
        lastName
        dni
        vote
        address
        message
        affiliate
        table {
          _id
          number
        }
      }
      factions {
        _id
      }
    }
    users {
      _id
      username
      name
      rol
    }
    anyFaction
  }
`;

export const tablesQuery = gql`
  query tablesQuery {
    tables {
      _id
      number
      description
      status
      voted
      totalPersons
      factions {
        _id
      }
    }
  }
`;

export const factionsQuery = gql`
  query adminQuery {
    factionsConfig {
      _id
      name
      color
      position
    }
    anyFaction
  }
`;

export const usersQuery = gql`
  query usersQuery {
    users {
      _id
      username
      name
      rol
    }
  }
`;

export const exportQuery = gql`
  query exportQuery {
    tables {
      _id
      number
      description
      status
      voted
      totalPersons
      factions {
        config {
          _id
          color
          name
          position
        }
        votes
      }
      persons {
        _id
        tableNumber
        order
        firstName
        lastName
        dni
        vote
        address
        message
        affiliate
      }
    }
  }
`;
