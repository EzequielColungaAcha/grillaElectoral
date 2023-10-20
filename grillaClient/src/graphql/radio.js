import { gql } from "@apollo/client";

export const radioQuery = gql`
  query radioQuery {
    tables {
      _id
      number
      description
      status
      totalPersons
      voted
      factions {
        _id
        config {
          color
          name
          position
        }
        votes
      }
    }
    personTotal
    personVoted
    factionChartJS
  }
`;
