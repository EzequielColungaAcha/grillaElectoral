import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    # // * Query for Users
    users: [User]!
    usersQuantity: Int!
    # // * ...

    # // * Query for Table
    tables: [Table]!
    tablesForFiscal(tableId: ID): [Table]!
    table(_id: ID!): Table!
    tablesWithCounts: [TableWithCounts]!
    tablesPaginated(
      limit: Int
      offset: Int
      search: String
    ): TablesPaginatedResult!
    # // * ...

    # // * Query for Person
    persons(
      limit: Int
      offset: Int
      tableNumber: Int
      search: String
      vote: Boolean
      affiliate: Boolean
    ): PersonsPaginatedResult!
    person(_id: ID!): Person!
    personsCount(
      tableNumber: Int
      search: String
      vote: Boolean
      affiliate: Boolean
    ): Int!
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

    # // * Query for logs
    logs(
      limit: Int
      offset: Int
      action: String
      startDate: String
      endDate: String
    ): LogsPaginatedResult!
    # // * ...
  }

  type Mutation {
    # // * Mutation for User
    registerUser(registerInput: RegisterInput): User
    loginUser(loginInput: LoginInput): User
    deleteUser(_id: ID!): User
    updateUserTableAssignment(_id: ID!, assignedTableId: ID): User
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
      referer: String
      driver: String
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
      referer: String
      driver: String
      tableId: ID
      userName: String
      userRol: String
      tableNumber: Int
      originalFirstName: String
      originalLastName: String
      originalDni: String
      originalVote: Boolean
      originalOrder: Int
      originalAddress: String
      originalMessage: String
      originalAffiliate: Boolean
      originalReferer: String
      originalDriver: String
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
    assignedTable: Table
  }

  input RegisterInput {
    username: String
    name: String
    password: String
    rol: String
    assignedTableId: ID
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

  type TableWithCounts {
    _id: ID!
    number: Int!
    description: String
    status: Status!
    totalPersons: Int
    voted: Int
    factionsCount: Int
  }

  type TablesPaginatedResult {
    tables: [TableWithCounts]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type LogEntry {
    id: ID!
    timestamp: String!
    level: String!
    message: String!
    action: String
    user: LogUser
    target: LogTarget
    changes: String
    metadata: String
  }

  type LogUser {
    id: String
    username: String!
    role: String!
    name: String!
  }

  type LogTarget {
    type: String!
    id: String
    identifier: String
    number: Int
  }

  type LogsPaginatedResult {
    logs: [LogEntry]!
    totalCount: Int!
    hasMore: Boolean!
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
    referer: String
    driver: String
    table: Table!
    tableNumber: Int!
    createdAt: String
    updatedAt: String
  }

  type PersonsPaginatedResult {
    persons: [Person]!
    totalCount: Int!
    hasMore: Boolean!
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
    referer: String
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
    referer: String
    driver: String
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
    personUpdated: Person!
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
    userTableAssignmentUpdated: User!
    factionDeleted: [Faction]
    alert: Alert!
    dataSaved: String
  }

  # // * ...
`;
