import { gql } from '@apollo/client';

export const radioQuery = gql`
  query radioQuery {
    tablesWithCounts {
      _id
      number
      description
      status
      totalPersons
      voted
      factionsCount
    }
    personTotal
    personVoted
    factionChartJS
  }
`;
