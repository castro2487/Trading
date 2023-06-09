import { ImpliedVolatilityType, Position, Ticker } from "common/types";
import { Tickers } from "services/webSocketSlice";
import { getOptionInstrumentParts, getTickersForBook } from "store/storeUtils";
interface StrikeVolatilityData {
    strike: number
    markIV: number
    moneyness: number
}

const REACT_APP_IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS_ENV = process.env.REACT_APP_IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS || '0.1'
const IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS = parseFloat(REACT_APP_IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS_ENV)

export const calculateVolatilitySmileForDomain = (
    domain: number[],
    tickers: Tickers,
    position: Position,
    implVolType: ImpliedVolatilityType,
    t: number,
    minTExp: number): number[] => {

    const timeToExpiry = Math.max(t, minTExp)

    if (implVolType === ImpliedVolatilityType.STICKY_STRIKE) {
        const iv = tickers[position.instrument].volatility! / 100
        return new Array(domain.length).fill(iv)
    }

    if (domain.length === 1) {
        return [tickers[position.instrument].volatility! / 100]
    }

    const currentBookTickers = getTickersForBook(tickers, position.instrument)

    // Index or mark price?
    const expiryData = getOrderBookMoneynessMap(currentBookTickers, tickers[position.instrument].indexPrice, timeToExpiry)

    // const posSmile = buildIVCurveForPositionInterpolate(domain, expiryData, getOptionInstrumentParts(position.instrument).strike, t)
    const posSmile = buildIVCurveForPositionInterpolate2(domain, expiryData, position, t, IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS)
    return posSmile
}

const buildIVCurveForPositionInterpolate2 = (domain: number[],
    expiryStrikeVolatilityData: StrikeVolatilityData[], position: Position, t,
    maxExtrapolationPerMoneyness: number) => {

    let res: number[] = []

    const { strike } = getOptionInstrumentParts(position.instrument)

    // can be taken the lowest and the highest strike data, no need probably for this
    const { maxMoneyness, minMoneyness } = expiryStrikeVolatilityData.reduce((memo, current) => {
        return {
            maxMoneyness: Math.max(current.moneyness, memo.maxMoneyness),
            minMoneyness: Math.min(current.moneyness, memo.minMoneyness)
        }
    }, { maxMoneyness: Number.MIN_SAFE_INTEGER, minMoneyness: Number.MAX_SAFE_INTEGER })

    for (const x of domain) {
        const moneyness = calculateMoneyness(x, strike, t)
        if (moneyness >= maxMoneyness) {
            const underlyingPriceIVData = getExtrapolatedIVStrikeData(x, strike, expiryStrikeVolatilityData[0], expiryStrikeVolatilityData[1], t, maxExtrapolationPerMoneyness)
            res.push(underlyingPriceIVData.markIV)
        } else if (moneyness <= minMoneyness) {
            const underlyingPriceIVData = getExtrapolatedIVStrikeData(x, strike, expiryStrikeVolatilityData[expiryStrikeVolatilityData.length - 1], expiryStrikeVolatilityData[expiryStrikeVolatilityData.length - 2], t, maxExtrapolationPerMoneyness)
            res.push(underlyingPriceIVData.markIV)
        } else {
            for (let i = 0; i < expiryStrikeVolatilityData.length - 1; i++) {
                if ((expiryStrikeVolatilityData[i].moneyness > moneyness &&
                    expiryStrikeVolatilityData[i + 1].moneyness < moneyness)
                    || (expiryStrikeVolatilityData[i].moneyness < moneyness &&
                        expiryStrikeVolatilityData[i + 1].moneyness > moneyness)) {

                    const iv = interpolateIVBetweenStrikes(expiryStrikeVolatilityData[i], expiryStrikeVolatilityData[i + 1], moneyness)
                    res.push(iv)
                } else if (expiryStrikeVolatilityData[i].moneyness === moneyness) {
                    res.push(expiryStrikeVolatilityData[i].markIV)
                } else {
                    if (i === expiryStrikeVolatilityData.length - 2 && expiryStrikeVolatilityData[i].moneyness === moneyness) {
                        res.push(expiryStrikeVolatilityData[i].markIV)
                    }
                }
            }
        }
    }
    return res
}

const interpolateIVBetweenStrikes = (below: StrikeVolatilityData, above: StrikeVolatilityData, currentMoneyness: number) => {
    return ((below.markIV ** 2 * (above.moneyness - currentMoneyness) + above.markIV ** 2 * (currentMoneyness - below.moneyness)) / (above.moneyness - below.moneyness)) ** 0.5
}

const getOrderBookMoneynessMap = (tickers: Ticker[],
    underlyingPrice: number,
    t: number) => {

    let existingStrikesMoneyness: StrikeVolatilityData[] = tickers.map(ticker => {
        const instrumentParts = getOptionInstrumentParts(ticker.instrument)
        const moneyness = calculateMoneyness(underlyingPrice, instrumentParts.strike, t)
        return {
            strike: instrumentParts.strike,
            moneyness,
            markIV: ticker.volatility! / 100
        }
    })
        .sort((a, b) => a.strike - b.strike)

    return existingStrikesMoneyness
}

const calculateMoneyness = (x: number, strike: number, t: number) => {
    return Math.log(x / strike) / Math.sqrt(t)
}

/**
 * 
 * TODO doc
 * 
 * @param newStrike 
 * @param underlyingPrice 
 * @param closer 
 * @param further 
 * @param t 
 * @returns 
 */
const getExtrapolatedIVStrikeData = (
    x: number,
    strike: number,
    closer: StrikeVolatilityData,
    further: StrikeVolatilityData,
    t: number,
    maxExtrapolationPerMoneyness: number) => {

    const moneyness = calculateMoneyness(x, strike, t)

    let xx1 = closer.markIV * (1 + maxExtrapolationPerMoneyness * (Math.min(2, Math.max(moneyness, 0.5))))
    let xx2 = further.markIV ** 2 + (moneyness - further.moneyness) / (closer.moneyness - further.moneyness) * (closer.markIV ** 2 - further.markIV ** 2)
    let xx3 = Math.sqrt(xx2)
    let xx4 = Math.min(xx1, xx3)
    let xx5 = closer.markIV * (1 - maxExtrapolationPerMoneyness * Math.min(2, Math.max(moneyness - closer.moneyness, 0.5)))

    let markIV = Math.max(xx4, xx5);

    return {
        strike: x,
        moneyness,
        markIV
    }
}
