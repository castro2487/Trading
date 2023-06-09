import { AccountPortfolios, Position } from "common/types"
import { PortfolioType } from "generated/graphql"
import gql from "graphql-tag"
import { client } from "index"
import { getPositionsFromPortfoliosByPorfolioType } from "./webSocketUtils"

const UPDATE_REAL_POSITIONS = gql`
mutation SyncPositionsForUserMutation($syncPositionsForUserInput: SyncUserAccountsPositionsInput!) {
  syncPositionsForUser(input: $syncPositionsForUserInput) {
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
        direction,
        instrument,
        positionType,
        uuid
      }
    }
  }
}
`

export const syncPositions = async (accountPortfolios: AccountPortfolios[], offlinePositions: Position[], mainAccountPlatformId?: number) => {
  const accountsMapped = accountPortfolios.map(accPos => {
    return {
      accountPlatformId: accPos.accountPlatformId,
      portfolioType: PortfolioType.Real,
      positions: [
        ...getPositionsFromPortfoliosByPorfolioType(accPos.portfolios)
      ]
    }
  })

  const res = await client.mutate({
    mutation: UPDATE_REAL_POSITIONS,
    variables: {
      syncPositionsForUserInput: {
        accountsWithPositions: accountsMapped,
        offlinePositions,
        mainAccountPlatformId
      }
    }
  })

  return Promise.resolve({ data: res })
}
