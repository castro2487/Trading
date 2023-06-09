import { Position } from "common/types"
import gql from "graphql-tag"
import { client } from "index"

const ADD_SIMULATED_POSITION = gql`
mutation CreatePositionMutation($createPositionInput: CreatePositionInput!) {
  createPosition(input: $createPositionInput) {
    uuid
  }
}
`

const GET_POSITION_GROUPS_FOR_ACCOUNT = gql`
query Query($portfoliosByUserInput: Int!) {
  portfoliosByUser(input: $portfoliosByUserInput) {
    uuid,
    accountPlatformId,
    portfolios {
      equity,
      name,
      portfolioType,
      uuid,
      positions {
        amount,
        averagePrice,
        instrument,
        positionType,
        direction,
        uuid
      }
    }
  }
}
`

export const addSimulatedPosition = async (position: Position) => {

  return await client.mutate({
    mutation: ADD_SIMULATED_POSITION,
    variables: {
      createPositionInput: {
        averagePrice: position.averagePrice,
        amount: position.amount,
        direction: position.direction,
        instrument: position.instrument,
        positionType: position.positionType
      }
    }
  })
}

export const getPositionsForAccount = async (accountPlatformId: string) => {
  return await client.query({
    query: GET_POSITION_GROUPS_FOR_ACCOUNT,
    variables: {
      portfoliosByUserInput: parseInt(accountPlatformId)
    }
  })
}
