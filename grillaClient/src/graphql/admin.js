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
        referer
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
      assignedTable {
        _id
        number
      }
    }
  }
`;

export const logsQuery = gql`
  query logsQuery(
    $limit: Int
    $offset: Int
    $action: String
    $startDate: String
    $endDate: String
  ) {
    logs(
      limit: $limit
      offset: $offset
      action: $action
      startDate: $startDate
      endDate: $endDate
    ) {
      logs {
        id
        timestamp
        level
        message
        action
        user {
          id
          username
          role
          name
        }
        target {
          type
          id
          identifier
          number
        }
        changes
        metadata
      }
      totalCount
      hasMore
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
        _id
        votes
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
        referer
        driver
        updatedAt
      }
    }
    logs {
      logs {
        id
        timestamp
        level
        message
        action
        user {
          id
          username
          role
          name
        }
        target {
          type
          id
          identifier
          number
        }
        changes
        metadata
      }
      totalCount
      hasMore
    }
  }
`;
