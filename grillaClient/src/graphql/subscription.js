import { gql } from "graphql-tag";

export const PERSON_VOTED = gql`
  subscription {
    personVoted {
      _id
      firstName
      lastName
      dni
      order
      vote
      message
      address
      affiliate
      table {
        _id
      }
      tableNumber
    }
  }
`;

export const TABLE_CHANGED = gql`
  subscription {
    tableChange {
      _id
      number
      status
      description
      factions {
        _id
      }
    }
  }
`;

export const PERSON_ADDED = gql`
  subscription {
    personAdded {
      _id
      firstName
      lastName
      dni
      vote
      order
      message
      address
      affiliate
      table {
        _id
      }
      tableNumber
    }
  }
`;

export const PERSON_DELETED = gql`
  subscription {
    personDeleted {
      _id
      firstName
      lastName
      dni
      order
      vote
      message
      address
      affiliate
      table {
        _id
      }
      tableNumber
    }
  }
`;

export const TABLE_ADDED = gql`
  subscription {
    tableAdded {
      _id
      number
      status
      description
    }
  }
`;

export const TABLE_DELETED = gql`
  subscription {
    tableDeleted {
      _id
    }
  }
`;

export const MULTIPLE_PERSONS_ADDED = gql`
  subscription {
    multiplePersonsAdded
  }
`;

export const FACTION_VOTES_SEND = gql`
  subscription {
    factionVotesSend
  }
`;

export const FACTION_VOTES_UPDATE = gql`
  subscription {
    factionVotesUpdate
  }
`;

export const FACTION_CONFIG_ADDED = gql`
  subscription {
    factionConfigAdded {
      _id
      name
      color
    }
  }
`;

export const FACTION_CONFIG_DELETED = gql`
  subscription {
    factionConfigDeleted {
      _id
    }
  }
`;

export const FACTION_CONFIG_UPDATE = gql`
  subscription factionConfigUpdate {
    factionConfigUpdate {
      _id
      name
      color
    }
  }
`;

export const USER_ADDED = gql`
  subscription {
    userAdded {
      _id
    }
  }
`;

export const USER_DELETED = gql`
  subscription {
    userDeleted {
      _id
    }
  }
`;

export const FACTION_DELETED = gql`
  subscription {
    factionDeleted {
      _id
    }
  }
`;

export const SAVED_DATA = gql`
  subscription {
    dataSaved
  }
`;
