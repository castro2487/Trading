import { GraphLine, OptionType, Position, PositionWithTicker } from "common/types"
import differenceInMinutes from "date-fns/differenceInMinutes"
import parseISO from "date-fns/parseISO"

// TODO: functional tests

const MONTHS_MAP = {
    JAN: `01`,
    FEB: `02`,
    MAR: `03`,
    APR: `04`,
    MAY: `05`,
    JUN: `06`,
    JUL: `07`,
    AUG: `08`,
    SEP: `09`,
    OCT: `10`,
    NOV: `11`,
    DEC: `12`,
}

export const sanitizeNumber = (x: number) => {
    if (x === Number.NEGATIVE_INFINITY) {
        return Number.MIN_SAFE_INTEGER
    } else if (x === Number.POSITIVE_INFINITY) {
        return Number.MAX_SAFE_INTEGER
    }
    return x
}

export const getFutureProperties = ({ position: future, ticker }: PositionWithTicker, expireTimestamp?: number) => {
    const { timeToExpiryMin, timeFromTodayMin } = getFutureInstrumentParameters(future.instrument, expireTimestamp)
    const t = timeToExpiryMin / 525600
    // We calculate interest rate from now. We only use timestamp for simulation
    const r = Math.log(ticker.markPrice / ticker.indexPrice!) / sanitizeNumber(timeFromTodayMin / 525600)
    return { r, t }
}

export const getFutureInstrumentParameters = (instrument: string, expireTimestamp?: number) => {
    const expiryDate = getDateFromInstrumentString(instrument)
    const dateFrom = expireTimestamp ? new Date(expireTimestamp) : new Date()
    const timeFromTodayMin = -differenceInMinutes(new Date(), expiryDate)
    const timeToExpiryMin = -differenceInMinutes(dateFrom, expiryDate)

    return {
        timeToExpiryMin,
        timeFromTodayMin
    }
}

export const getOptionProperties = ({ position: option, ticker }: PositionWithTicker, expireTimestamp) => {
    const parts = option.instrument.split('-')
    const expiryDate = getDateFromInstrumentString(option.instrument)
    const dateFrom = expireTimestamp ? new Date(expireTimestamp) : new Date()
    const timeToExpiryMin = differenceInMinutes(expiryDate, dateFrom)
    const timeFromTodayMin = differenceInMinutes(expiryDate, new Date())
    const t = timeToExpiryMin / 525600
    const r = Math.log(ticker.underlyingPrice! / ticker.indexPrice!) / (timeFromTodayMin / 525600)
    return {
        strike: parseInt(parts[2]),
        t,
        r,
        optionType: parts[3] === 'C' ? OptionType.CALL : OptionType.PUT
    }
}

export const getDateFromInstrumentString = (instrument: string) => {
    const parts = instrument.split('-')
    let instrumentDateString = parts[1]
    if (instrumentDateString.length === 6) {
        instrumentDateString = `0${instrumentDateString}`
    }
    const day = instrumentDateString.substr(0, 2)
    const month = instrumentDateString.substr(2, 3)
    const lastTwoDigitsOfYear = instrumentDateString.substr(5, 2)
    const dateString = `20${lastTwoDigitsOfYear}-${MONTHS_MAP[month]}-${day}T20:00:00`
    return parseISO(dateString)
}

export const getXAxisValues = (min: number, max: number, step: number) => {
    const res: number[] = []
    for (let x = min; x < max; x += step) {
        res.push(x)
    }
    return res
}

export const sumLines = (baseLine: number[], lineToBeAdded: number[]) => {

    if (baseLine.length === 0) {
        return lineToBeAdded
    }

    let res: number[] = []
    for (let i = 0; i < baseLine.length; i++) {

        res.push(baseLine[i] + lineToBeAdded[i])
    }
    return res
}

export const getUnexpiredPositionsByDate = (positions: Position[], timestamp: number) => {
    return positions.filter(p => getDateFromInstrumentString(p.instrument).valueOf() >= timestamp)
}

export const mergeGraphLines = (line1: GraphLine, line2: number[]) => {
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    let closestToRoot = Number.MAX_SAFE_INTEGER
    let closestIndexToRoot = 0

    let values: number[] = []

    for (let i = 0; i < line2.length; i++) {
        const summedIndex = line1.values[i] + line2[i]
        values.push(summedIndex)

        min = Math.min(min, summedIndex)
        max = Math.max(max, summedIndex)

        if (Math.abs(summedIndex) < closestToRoot) {
            closestIndexToRoot = i
            closestToRoot = Math.abs(summedIndex)
        }
    }

    return {
        min,
        max,
        values,
        closestIndexToRoot
    }
}


