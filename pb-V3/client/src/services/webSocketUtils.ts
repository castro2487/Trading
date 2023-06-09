import { AccountPortfolios, Portfolio, Position } from "common/types"
import { PortfolioType } from "generated/graphql"

export const getAllInstrumentsInAccountsArray = (accountPortfolios: AccountPortfolios[]) => {
    return accountPortfolios.reduce((memo, current) => {
        return [...memo,
        ...current.portfolios.reduce((portMemo, currentPortfolio) => {
            return [...portMemo, ...currentPortfolio.positions.map(p => p.instrument)]
        }, [] as string[])
        ]
    }, [] as string[])
}

export const getNonDuplicateStringsFromArrays = (arr1: string[], arr2: string[]) => {
    let res: string[] = []
    const set = new Set(arr1)
    const set2 = new Set(arr2)

    for (const s of Array.from(set2)) {
        if (!set.has(s)) {
            res.push(s)
        }
    }

    return res
}

export const getInstrumenentsFromPositionsWithoutDuplications = (positions: Position[]) => {
    let res: string[] = []
    const set = new Set(positions.map(p => p.instrument))
    return Array.from(set)
}

/**
 * Returns all the positions by a given instrument from a list of portfolios. Looks intimidating
 * at first but it is small and concise. We can make it more readable if we break it out in several
 * functions.
 * 
 * @param {string} instrument 
 * @param {AccountPortfolios} accountsPortfolios 
 * @returns {Position} Array of all the positions that have a given instrument
 */
export const getPositionsByInstrument = (instrument: string, accountsPortfolios: AccountPortfolios[]) => {
    return accountsPortfolios.reduce((memo, current) => {
        return [...memo,
        ...current.portfolios.reduce((memoPositions, currentPortfolio) => {
            return [...memoPositions, ...currentPortfolio.positions.filter(p => p.instrument === instrument)]
        }, [] as Position[])
        ]
    }, [] as Position[])
}


export const getPositionsFromPortfoliosByPorfolioType = (portfolios: Portfolio[], type = PortfolioType.Real) => {
    return portfolios.reduce((memo, current) => {
        return current.portfolioType === type ? [...memo, ...current.positions] : memo
    }, [] as Position[])
}
