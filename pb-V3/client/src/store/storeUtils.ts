import { getDateFromInstrumentString } from "common/calculationsCore/calculationUtils";
import { AccountPortfolios, Position } from "common/types";
import { PositionDirection } from "generated/graphql";
import { Tickers } from "services/webSocketSlice";

export const getAllPositions = (accountPortfolios: AccountPortfolios[], offlinePositions: Position[], instrument?: string) => {

    const portfoliosPositions = accountPortfolios.reduce((memo, current) => {
        return [...memo,
        ...current.portfolios.reduce((portMemo, currentPortfolio) => {
            return [...portMemo, ...currentPortfolio.positions]
        }, [] as Position[])
        ]
    }, [] as Position[])

    return [...portfoliosPositions, ...offlinePositions]
}

export const getExpirations = (positions: Position[]) => {
    return positions
        .map(p => getDateFromInstrumentString(p.instrument))
        .sort((a, b) => a.valueOf() - b.valueOf())
}

/**
 * Finds all instruments for every strike that exist in a book. TODO explain more
 * @param {string[]} positionsInstruments 
 */
export const getAllBooksInstruments = (positionsInstruments: string[], allPossibleInstrumentsStrings: string[]) => {

    const options = allPossibleInstrumentsStrings.filter(i => i.split('-').length === 4)
    const futures = positionsInstruments.filter(i => i.split('-').length === 2)

    let res: string[] = []
    for (const instrument of positionsInstruments) {

        const instrumentParts = instrument.split('-')
        const bookName = [instrumentParts[0], instrumentParts[1]].join('-')

        const allBookInstruments = options
            .filter(i => i.includes(bookName))
            .filter(i => i.split('-')[3] === instrumentParts[3])
        res = [...res, ...allBookInstruments]
    }
    return [...res, ...futures]
}

export const getTickersForBook = (tickers: Tickers, instrument: string) => {

    const currentBookInstruments = getAllBooksInstruments([instrument], Object.keys(tickers))
    // const currentBookTickers = currentBookInstruments.map(i => tickers[i])
    return currentBookInstruments.map(i => tickers[i])
    // return arrayToObject(currentBookTickers, 'instrument')
}

// TODO add other parts
export const getOptionInstrumentParts = (instrument: string) => {
    const parts = instrument.split('-')

    return {
        currency: parts[0],
        date: parts[1],
        strike: parseInt(parts[2]),
        direction: parts[3] === 'C' ? PositionDirection.Buy : PositionDirection.Sell
    }
}
