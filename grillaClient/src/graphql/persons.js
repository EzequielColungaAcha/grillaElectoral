import { gql } from "@apollo/client";

export const CREATE_PERSON = gql`
  mutation (
    $firstName: String!
    $lastName: String!
    $dni: String!
    $vote: Boolean!
    $order: Int!
    $tableId: ID!
    $tableNumber: Int!
    $address: String
    $message: String
    $affiliate: Boolean
    $userName: String
    $userRol: String
  ) {
    createPerson(
      firstName: $firstName
      lastName: $lastName
      dni: $dni
      vote: $vote
      order: $order
      address: $address
      message: $message
      affiliate: $affiliate
      tableId: $tableId
      tableNumber: $tableNumber
      userName: $userName
      userRol: $userRol
    ) {
      _id
      firstName
      lastName
      dni
      vote
      order
      address
      message
      affiliate
      table {
        _id
      }
      tableNumber
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation ($id: ID!) {
    deletePerson(_id: $id) {
      _id
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation (
    $id: ID!
    $firstName: String
    $lastName: String
    $dni: String
    $vote: Boolean
    $order: Int
    $address: String
    $message: String
    $affiliate: Boolean
  ) {
    updatePerson(
      _id: $id
      firstName: $firstName
      lastName: $lastName
      dni: $dni
      vote: $vote
      order: $order
      address: $address
      message: $message
      affiliate: $affiliate
    ) {
      _id
    }
  }
`;

export const UPDATE_VOTE = gql`
  mutation (
    $id: ID!
    $vote: Boolean
    $firstName: String
    $lastName: String
    $dni: String
    $order: Int
    $address: String
    $message: String
    $affiliate: Boolean
    $userName: String
    $userRol: String
    $tableNumber: Int
  ) {
    updatePerson(
      _id: $id
      vote: $vote
      firstName: $firstName
      lastName: $lastName
      dni: $dni
      order: $order
      address: $address
      message: $message
      affiliate: $affiliate
      userName: $userName
      userRol: $userRol
      tableNumber: $tableNumber
    ) {
      vote
    }
  }
`;

export const CREATE_MULTIPLE_PERSONS = gql`
  mutation ($data: [Record]) {
    setMultipleRecord(data: $data)
  }
`;

export const CREATE_MASSIVE_PERSONS = gql`
  mutation SetMassiveRecord($data: [Racord]) {
    setMassiveRecord(data: $data)
  }
`;

export const UPDATE_AFFILIATE_PERSONS = gql`
  mutation ($data: [AffiliateRecord]) {
    setMultipleAffiliate(data: $data)
  }
`;

export const GET_PERSONS = gql`
  query Persons {
    persons {
      _id
      address
      affiliate
      dni
      firstName
      lastName
      message
      order
      vote
      tableNumber
    }
    tables {
      number
      totalPersons
    }
  }
`;
