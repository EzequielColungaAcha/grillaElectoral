import { gql } from "@apollo/client";

export const GET_TABLES = gql`
  query getTables {
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

export const GET_RADIO_TABLES = gql`
  query getTables {
    tables {
      _id
      number
      description
      status
      totalPersons
      voted
    }
    personTotal
    personVoted
  }
`;

export const SPECTATOR_TABLES = gql`
  query getTables {
    tables {
      _id
      number
      description
      status
      persons {
        _id
        order
        lastName
        firstName
        dni
        vote
        address
        message
        affiliate
      }
      factions {
        _id
      }
    }
  }
`;

export const GET_TABLE = gql`
  query getTable($id: ID!) {
    table(_id: $id) {
      _id
      number
      description
      status
      persons {
        _id
        firstName
        lastName
        dni
        vote
        order
        address
        affiliate
        message
        tableNumber
      }
      factions {
        _id
      }
      totalPersons
      voted
    }
  }
`;

export const CREATE_TABLE = gql`
  mutation ($number: Int!, $description: String, $status: Status!) {
    createTable(number: $number, description: $description, status: $status) {
      _id
      number
      description
      status
    }
  }
`;

export const DELETE_TABLE = gql`
  mutation ($id: ID!) {
    deleteTable(_id: $id) {
      _id
    }
  }
`;

export const UPDATE_STATUS = gql`
  mutation (
    $id: ID!
    $number: Int!
    $status: Status!
    $userName: String
    $userRol: String
  ) {
    updateTable(
      _id: $id
      number: $number
      status: $status
      userName: $userName
      userRol: $userRol
    ) {
      status
    }
  }
`;

export const UPDATE_TABLE = gql`
  mutation ($id: ID!, $number: Int!, $description: String, $status: Status!) {
    updateTable(
      _id: $id
      number: $number
      description: $description
      status: $status
    ) {
      _id
    }
  }
`;
