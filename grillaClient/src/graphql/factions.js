import { gql } from '@apollo/client';

export const CREATE_FACTION = gql`
  mutation ($name: String!, $votes: Int!, $tableId: ID!) {
    createFaction(name: $name, votes: $votes, tableId: $tableId) {
      _id
      name
      votes
      table {
        _id
      }
    }
  }
`;

export const CREATE_FACTION_CONFIG = gql`
  mutation ($name: String!, $color: String!, $position: String!) {
    createFactionConfig(name: $name, color: $color, position: $position) {
      _id
      name
      color
      position
    }
  }
`;

export const UPDATE_FACTION = gql`
  mutation ($id: ID!, $votes: Int!) {
    updateFaction(_id: $id, votes: $votes) {
      _id
      votes
    }
  }
`;

export const UPDATE_FACTION_CONFIG = gql`
  mutation ($id: ID!, $name: String!, $color: String!, $position: String!) {
    updateFactionConfig(
      _id: $id
      name: $name
      color: $color
      position: $position
    ) {
      _id
      name
      color
      position
    }
  }
`;

export const GET_FACTION_CONFIG = gql`
  query getFactionConfig {
    factionsConfig {
      _id
      name
      color
      position
    }
  }
`;

export const DELETE_FACTION_CONFIG = gql`
  mutation ($id: ID!) {
    deleteFactionConfig(_id: $id) {
      _id
    }
  }
`;

export const SEND_VOTES = gql`
  mutation (
    $data: [FactionRecord]
    $userName: String
    $userRol: String
    $tableNumber: Int
  ) {
    setMultipleFactionRecord(
      data: $data
      userName: $userName
      userRol: $userRol
      tableNumber: $tableNumber
    )
  }
`;

export const GET_TABLE_VOTES = gql`
  query getTableVotes($id: ID!) {
    table(_id: $id) {
      _id
      factions {
        _id
        votes
        config {
          _id
          name
          color
          position
        }
      }
    }
  }
`;

export const UPDATE_VOTES = gql`
  mutation (
    $data: [FactionRecordUpdate]
    $userName: String
    $userRol: String
    $tableNumber: Int
  ) {
    updateMultipleFactionRecord(
      data: $data
      userName: $userName
      userRol: $userRol
      tableNumber: $tableNumber
    )
  }
`;

export const ANY_FACTION = gql`
  query anyFaction {
    anyFaction
  }
`;

export const FACTIONS_CHART = gql`
  query chart {
    factionChartJS
  }
`;

export const FACTION_DELETE = gql`
  mutation ($id: ID!, $status: Status) {
    deleteFaction(_id: $id, status: $status) {
      acknowledged
    }
  }
`;
