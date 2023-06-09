/**
 * Place for putting logic for calculating everything connected to options and features.
 */
import { PositionType } from 'generated/graphql';
import { Tickers } from 'services/webSocketSlice';
import { AccountPortfolios, ChartLines, Currency, GraphLine, ImpliedVolatilityType, Position, Ticker } from '../types';
import { getUnexpiredPositionsByDate, getFutureProperties, getOptionProperties, sumLines, mergeGraphLines } from './calculationUtils';
import { getFuturePnlForDomain } from './futurePnlCalculator';
import { getOptionPnlForDomain } from './optionPnlCalculator';

// ----------------------------------------- // 
// ---------------- PUBLIC ----------------- // 
// ----------------------------------------- //

const EPSILON_ENV = process.env.REACT_APP_LINE_ROOT_EPISON || '0.0000000001'
const EPSILON = parseFloat(EPSILON_ENV)

// TODO 
export const getPnlForPositionsOverDomain = (domain: number[],
    positions: Position[],
    tickers: Tickers,
    currency: Currency,
    implVolType: ImpliedVolatilityType,
    timestampExpiry?: number) => {

    let expireSum: GraphLine = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER,
        root: -1,
        values: new Array(domain.length).fill(0)
    }

    let todaySum: GraphLine = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER,
        root: -1,
        values: new Array(domain.length).fill(0)
    }
    console.time(`${positions.length} positions calc took`)
    let volatilitySmileAvg: number[] = []
    const filteredPositions = timestampExpiry ? getUnexpiredPositionsByDate(positions, timestampExpiry) : positions

    for (const position of filteredPositions) {

        const { expireLine,
            todayLine,
            volatilitySmile
        } = getPositionValuesForDomain(domain, position, tickers, currency, implVolType, timestampExpiry)

        volatilitySmileAvg = volatilitySmile
        expireSum = mergeGraphLines(expireSum, expireLine)
        todaySum = mergeGraphLines(todaySum, todayLine)
    }

    const todayPriceForRoot = findPriceForRootWithPrecision(EPSILON, 'todayLine', domain, todaySum, filteredPositions, tickers, currency, implVolType)
    const expirePriceForRoot = findPriceForRootWithPrecision(EPSILON, 'expireLine', domain, expireSum, filteredPositions, tickers, currency, implVolType)

    console.timeEnd(`${positions.length} positions calc took`)
    return Promise.resolve({
        expireLine: {
            ...expireSum,
            root: expirePriceForRoot
        },
        todayLine: {
            ...todaySum,
            root: todayPriceForRoot
        },
        // volatilitySmile: volatilitySmileAvg
    })
    // return 
}

/**
 * 
 * @param domain 
 * @param todayLine 
 * @param expireLine 
 */
export const getChartLinesAfterRemovePosition = (domain: number[], todayLine: number[], expireLine: []) => {
    // TODO
}


// Would not work if multiple positions are added. Because chart lines will not be updated
// and only the last one will stay.
export const getChartLinesAfterAddingPositions = (
    domain: number[],
    chartLines: ChartLines,
    positions: Position[],
    tickers: Tickers,
    currency: Currency) => {

    // let expireSum: number[] = []
    // let todaySum: number[] = []

    // for (const position of positions) {

    //     const { expireLine,
    //         todayLine
    //     } = getPositionValuesForDomain(domain, position, tickers, currency)

    //     expireSum = chartLines.expireLine.values.length === 0 ?
    //         expireLine : sumLines(chartLines.expireLine.values, expireLine)

    //     todaySum = chartLines.todayLine.values.length === 0 ?
    //         todayLine : sumLines(chartLines.todayLine.values, todayLine)
    // }



    // return {
    //     expireLine: {
    //         max: 0,
    //         min: 0,
    //         root: 0,
    //         values: expireSum
    //     },
    //     todayLine: {
    //         max: 0,
    //         min: 0,
    //         root: 0,
    //         values: todaySum
    //     }
    // }
}

/**
 * Recalculates the pnl after a position has been added. We calculate the new position pnl
 * and then we add it to the pnl of the previous positions.
 * 
 * @param domain 
 * @param chartLines 
 * @param position 
 * @param ticker 
 * @param currency 
 * @returns 
 */
export const getChartLinesAfterAddingPosition = (
    domain: number[],
    chartLines: ChartLines,
    position: Position,
    tickers: Tickers,
    currency: Currency) => {

    // const { expireLine,
    //     todayLine
    // } = getPositionValuesForDomain(domain, position, tickers, currency)

    // const expireSum = chartLines.expireLine.values.length === 0 ?
    //     expireLine : sumLines(chartLines.expireLine.values, expireLine)

    // const todaySum = chartLines.todayLine.values.length === 0 ?
    //     todayLine : sumLines(chartLines.todayLine.values, todayLine)

    // return {
    //     expireLine: {
    //         max: 0,
    //         min: 0,
    //         root: 0,
    //         values: expireSum
    //     },
    //     todayLine: {
    //         max: 0,
    //         min: 0,
    //         root: 0,
    //         values: todaySum
    //     }
    // }
}

// ----------------------------------------- // 
// ---------------- PRIVATE ---------------- // 
// ----------------------------------------- // 

/**
 *  First we calculate interest and time to expiry for current ticker values and use them to 
 *  calculate pnl for a position over a domain.
 * 
 * @param domain 
 * @param position 
 * @param ticker 
 * @param currency 
 * @returns 
 */
const getPositionValuesForDomain = (
    domain: number[],
    position: Position,
    tickers: Tickers,
    currency: Currency,
    implVolType: ImpliedVolatilityType,
    expireTimestamp?: number) => {

    if (position.positionType === PositionType.Future) {
        const { r, t } = getFutureProperties({ position, ticker: tickers[position.instrument] }, expireTimestamp)
        return getFuturePnlForDomain(domain, currency, r, t, position)
    } else {
        const { strike, t, r, optionType } = getOptionProperties({ position, ticker: tickers[position.instrument] }, expireTimestamp)
        return getOptionPnlForDomain(domain, currency, r, t, position, strike, tickers, optionType, implVolType)
    }
}

/**
 * Calculates the pnl for a group of positions.
 * 
 * @param positions 
 * @param currency 
 * @param tickers 
 * @param domain 
 * @returns 
 */
const getPnlForPositions = (domain: number[],
    positions: Position[],
    tickers: Tickers,
    currency: Currency,
    implVolType: ImpliedVolatilityType,
    timestampExpiry?: number) => {

    let expireSum = new Array(domain.length).fill(0)
    let todaySum = new Array(domain.length).fill(0)

    const filteredPositions = timestampExpiry ? getUnexpiredPositionsByDate(positions, timestampExpiry) : positions

    for (const position of filteredPositions) {

        const { expireLine,
            todayLine
        } = getPositionValuesForDomain(domain, position, tickers, currency, implVolType)

        expireSum = sumLines(expireSum, expireLine)
        todaySum = sumLines(todaySum, todayLine)
    }

    return {
        expireLine: expireSum,
        todayLine: todaySum
    }
}

/**
 * 
 * 
 * @param epsilon 
 * @param lineName 
 * @param domain 
 * @param line 
 * @param positions 
 * @param tickers 
 * @param currency 
 * @param timestampExpiry 
 * @returns 
 */
const findPriceForRootWithPrecision = (
    epsilon,
    lineName: string,
    domain: number[],
    line: GraphLine,
    positions: Position[],
    tickers: Tickers,
    currency: Currency,
    implVolType: ImpliedVolatilityType,
) => {

    let leftPrice = domain[line.closestIndexToRoot! - 1]
    let middlePrice = domain[line.closestIndexToRoot!]
    let rightPrice = domain[line.closestIndexToRoot! + 1]

    let leftRes = getPnlForPositions([leftPrice], positions, tickers, currency, implVolType)
    let middleRes = getPnlForPositions([middlePrice], positions, tickers, currency, implVolType)
    let rightRes = getPnlForPositions([rightPrice], positions, tickers, currency, implVolType)

    if (Math.sign(leftRes[lineName]) === Math.sign(rightRes[lineName])) {
        return line.values[line.closestIndexToRoot!]
    }

    while (Math.abs(middleRes[lineName]) > epsilon) {
        let sl = Math.sign(leftRes[lineName])
        let sm = Math.sign(middleRes[lineName])

        if (sl === sm) {
            leftPrice = middlePrice
        } else {
            rightPrice = middlePrice
        }
        middlePrice = (leftPrice + rightPrice) / 2
        middleRes = getPnlForPositions([middlePrice], positions, tickers, currency, implVolType)
    }

    return middlePrice
}
