import { gql } from '@apollo/client';

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
    $referer: String
    $driver: String
    $originalFirstName: String
    $originalLastName: String
    $originalDni: String
    $originalVote: Boolean
    $originalOrder: Int
    $originalAddress: String
    $originalMessage: String
    $originalAffiliate: Boolean
    $originalReferer: String
    $originalDriver: String
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
      referer: $referer
      driver: $driver
      originalFirstName: $originalFirstName
      originalLastName: $originalLastName
      originalDni: $originalDni
      originalVote: $originalVote
      originalOrder: $originalOrder
      originalAddress: $originalAddress
      originalMessage: $originalMessage
      originalAffiliate: $originalAffiliate
      originalReferer: $originalReferer
      originalDriver: $originalDriver
    ) {
      _id
    }
  }
`;

export const UPDATE_VOTE = gql`
  mutation (
    $id: ID!
    $vote: Boolean
    $userName: String
    $userRol: String
    $tableNumber: Int
  ) {
    updatePerson(
      _id: $id
      vote: $vote
      userName: $userName
      userRol: $userRol
      tableNumber: $tableNumber
    ) {
      _id
      vote
      firstName
      lastName
      tableNumber
      order
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

export const GET_PERSONS_PAGINATED = gql`
  query PersonsPaginated(
    $limit: Int
    $offset: Int
    $tableNumber: Int
    $search: String
    $vote: Boolean
    $affiliate: Boolean
  ) {
    persons(
      limit: $limit
      offset: $offset
      tableNumber: $tableNumber
      search: $search
      vote: $vote
      affiliate: $affiliate
    ) {
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
        referer
        driver
        tableNumber
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_PERSONS_COUNT = gql`
  query PersonsCount(
    $tableNumber: Int
    $search: String
    $vote: Boolean
    $affiliate: Boolean
  ) {
    personsCount(
      tableNumber: $tableNumber
      search: $search
      vote: $vote
      affiliate: $affiliate
    )
  }
`;

export const GET_TABLES_WITH_COUNTS = gql`
  query TablesWithCounts {
    tablesWithCounts {
      _id
      number
      description
      status
      totalPersons
      voted
      factionsCount
    }
  }
`;

// # Keep the old query for backward compatibility but mark as deprecated
export const GET_PERSONS = gql`
  query Persons {
    persons(limit: 1000, offset: 0) {
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
        referer
        driver
        tableNumber
      }
      totalCount
      hasMore
    }
    tablesWithCounts {
      _id
      number
      totalPersons
    }
  }
`;
