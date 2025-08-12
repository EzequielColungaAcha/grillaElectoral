import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    # // * Query for Users
    users: [User]!
    usersQuantity: Int!
    # // * ...

    # // * Query for Table
    tables: [Table]!
    table(_id: ID!): Table!
    # // * ...

    # // * Query for Person
    persons: [Person]
    person(_id: ID!): Person!
    PersonArray: [Person]!
    # // * ...

    # // * Query for quantities
    personTotal: Int!
    personVoted: Int!
    personNoVoted: Int!
    votedPercent: Float!

    tableTotal(_id: ID!): Int!
    tableVoteTotal(_id: ID): Int!
    tableNoVoteTotal(_id: ID): Int!
    tableVoteTotalPercent(_id: ID): Float!

    totalAbiertaStatus: Int!
    totalCerradaStatus: Int!
    totalDatosEnviadosStatus: Int!
    # // * ...

    # // * Query for factions
    factionsConfig: [FactionConfig]
    anyFaction: Int!
    factionChartJS: String
    # // * ...
  }

  type Mutation {
    # // * Mutation for User
    registerUser(registerInput: RegisterInput): User
    loginUser(loginInput: LoginInput): User
    deleteUser(_id: ID!): User
    # // * ...

    # // * Mutation for Table
    createTable(number: Int!, description: String, status: Status!): Table

    updateTable(
      _id: ID!
      number: Int!
      description: String
      status: Status!
      userName: String
      userRol: String
    ): Table

    deleteTable(_id: ID!): Table
    # // * ...

    # // * Mutation for Faction
    createFaction(configId: ID!, votes: Int!, tableId: ID!): Faction

    createFactionConfig(
      name: String!
      color: String!
      position: String!
    ): FactionConfig

    updateFactionConfig(
      _id: ID!
      name: String!
      color: String!
      position: String!
    ): FactionConfig

    deleteFactionConfig(_id: ID!): FactionConfig

    updateFaction(_id: ID!, votes: Int!): Faction

    deleteFaction(_id: ID!, status: Status): deleteMany
    # // * ...

    # // * Mutation for Person
    createPerson(
      firstName: String!
      lastName: String!
      dni: String!
      vote: Boolean!
      order: Int!
      address: String
      message: String
      affiliate: Boolean
      tableId: ID!
      tableNumber: Int!
      userName: String
      userRol: String
    ): Person

    updatePerson(
      _id: ID!
      firstName: String
      lastName: String
      dni: String
      vote: Boolean
      order: Int
      address: String
      message: String
      affiliate: Boolean
      tableId: ID
      userName: String
      userRol: String
      tableNumber: Int
    ): Person

    deletePerson(_id: ID!): Person!

    setMultipleRecord(data: [Record]): String

    setMassiveRecord(data: [Racord]): String

    setMultipleAffiliate(data: [AffiliateRecord]): String

    setMultipleFactionRecord(
      data: [FactionRecord]
      userName: String
      userRol: String
      tableNumber: Int
    ): String
    updateMultipleFactionRecord(
      data: [FactionRecordUpdate]
      userName: String
      userRol: String
      tableNumber: Int
    ): String
    # // * ...

    # // * Mutation to change vote status
    updateVote(_id: ID!, vote: Boolean!): Person
    # // * ...
  }

  enum Status {
    Abierta
    Cerrada
    DatosEnviados
  }

  type deleteMany {
    acknowledged: Boolean
    deletedCount: Int
  }

  type Alert {
    _id: ID
    type: String
    person: Person
    table: Table
  }

  type User {
    _id: ID
    username: String
    name: String
    password: String
    token: String
    rol: String
  }

  input RegisterInput {
    username: String
    name: String
    password: String
    rol: String
  }

  input LoginInput {
    username: String
    password: String
  }

  type Table {
    _id: ID!
    number: Int!
    description: String
    status: Status!
    createdAt: String
    updatedAt: String
    persons: [Person]
    totalPersons: Int
    voted: Int
    factions: [Faction]
  }

  type Person {
    _id: ID!
    firstName: String!
    lastName: String!
    dni: String!
    vote: Boolean!
    order: Int!
    address: String
    message: String
    affiliate: Boolean
    table: Table!
    tableNumber: Int!
    createdAt: String
    updatedAt: String
  }

  input Record {
    firstName: String!
    lastName: String!
    dni: String!
    vote: Boolean!
    order: Int!
    address: String
    message: String
    affiliate: Boolean
    table: String!
    tableNumber: Int!
  }

  input Racord {
    firstName: String!
    lastName: String!
    dni: String
    order: Int!
    address: String
    tableNumber: String
    affiliate: Boolean
  }

  input AffiliateRecord {
    dni: String!
  }

  type FactionConfig {
    _id: ID!
    name: String!
    color: String!
    position: String!
  }

  type Faction {
    _id: ID!
    config: FactionConfig!
    votes: Int!
    percentage: Float
    seats: Int!
    table: Table!
  }

  input FactionRecord {
    config: String
    votes: Int!
    table: String
    name: String
  }

  input FactionRecordUpdate {
    _id: ID!
    votes: Int!
    name: String
  }

  type PersonArray {
    persons: [Person]!
  }

  type Percent {
    votedPercent: Float!
  }

  # // * Subscriptions
  type Subscription {
    personVoted: Person!
    tableChange: Table!
    personAdded: Person!
    personDeleted: Person!
    tableAdded: Table!
    tableDeleted: Table!
    multiplePersonsAdded: String
    factionConfigAdded: FactionConfig!
    factionConfigDeleted: FactionConfig!
    multipleFactionAdded: String
    multipleFactionUpdated: String
    factionVotesSend: String
    factionVotesUpdate: String
    factionConfigUpdate: FactionConfig!
    userAdded: User!
    userDeleted: User!
    userUpdated: User!
    factionDeleted: [Faction]
    alert: Alert!
    dataSaved: String
  }

  # // * ...
`;
