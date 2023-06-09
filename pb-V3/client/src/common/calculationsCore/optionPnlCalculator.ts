import { Currency, ImpliedVolatilityType, OptionType, Position } from "common/types"
import { PositionDirection } from "generated/graphql"
import { Tickers } from "services/webSocketSlice"
import { blackScholes } from "./blackScholes"
import { sanitizeNumber } from "./calculationUtils"
import { calculateVolatilitySmileForDomain } from "./volatilitySmile"

const IMPLIED_VOL_MIN_TEXP_ENV = process.env.REACT_APP_IMPLIED_VOL_MIN_TEXP || '0.000114155'
const IMPLIED_VOL_MIN_TEXP = parseFloat(IMPLIED_VOL_MIN_TEXP_ENV)

// ----------------------------------------- // 
// ---------------- PUBLIC ----------------- // 
// ----------------------------------------- //

/**
 * Calculates pnl for an option over a domain.
 * 
 * @param {number[]} domain - Array of values that represent the x axis for calculation.
 * @param {Currency} currency - Currency used for calculation
 * @param {number} r - The interest rate
 * @param {number} t - Time to expiry
 * @param {Position} position - Position that we calculate the pnl for
 * @param {number} strike - The strike of the position
 * @param {Tickers} tickers - Additional values needed for the calculation. For example current index price, underlying price etc.
 * @param {OptionType} optionType - Type of the option 
 * @param {ImpliedVolatilityType} optionType - Type of the volatility. Stiky strike or delta.
 * @returns {{todayLine: number[],expireLine: number[] }}
 */
export const getOptionPnlForDomain = (
    domain: number[],
    currency: Currency,
    r: number,
    t: number,
    position: Position,
    strike: number,
    tickers: Tickers,
    optionType: OptionType,
    implVolType: ImpliedVolatilityType,
) => {

    let todayLine: number[] = []
    let expireLine: number[] = []

    const volatilitySmile = calculateVolatilitySmileForDomain(domain, tickers, position, implVolType, t, IMPLIED_VOL_MIN_TEXP)

    for (const i in domain) {
        const markIV = volatilitySmile.length === 1 ? volatilitySmile[0] : volatilitySmile[i]
        const { expirePt, todayPt } = calculateOptionPointsForIndexX(currency,
            domain[i], r, t,
            strike,
            markIV,
            position.averagePrice,
            position.amount,
            position.direction,
            optionType)

        todayLine.push(todayPt)
        expireLine.push(expirePt)
    }

    return {
        todayLine,
        expireLine,
        volatilitySmile
    }
}


// ----------------------------------------- // 
// ---------------- PRIVATE ---------------- // 
// ----------------------------------------- //


/**
 * 
 * @param averagePrice 
 * @param strike 
 * @param x 
 * @param amount 
 * @param optionType 
 * @param positionDirection 
 * @returns 
 */
const getOptionExpireCryptoPnl = (averagePrice: number, strike: number, x: number,
    amount: number,
    optionType: OptionType,
    positionDirection: PositionDirection) => {

    if (optionType === OptionType.CALL) {
        if (positionDirection === PositionDirection.Buy) {
            return (Math.max(0, ((x - strike) / x)) - averagePrice) * amount
        } else {
            return Math.abs(amount) * averagePrice - Math.max((x - strike) / x, 0) * Math.abs(amount)
        }
    } else {
        if (positionDirection === PositionDirection.Buy) {
            return Math.max(((strike - x) / x) * Math.abs(amount), 0) - Math.abs(amount) * averagePrice
        } else {
            return Math.abs(amount) * averagePrice - Math.max((strike - x) / x, 0) * Math.abs(amount)
        }
    }
}

/**
 * Calculates the pnl for an option position at certain point.
 * 
 * @param currency 
 * @param x 
 * @param r 
 * @param t 
 * @param strike 
 * @param volotility 
 * @param averagePrice 
 * @param amount 
 * @param positionDirection 
 * @param optionType 
 * @returns {expirePt, todayPt} Expected pnl for the price x at expiry and today.
 */
const calculateOptionPointsForIndexX = (
    currency: Currency,
    x: number,
    r: number,
    t: number,
    strike: number,
    volotility: number,
    averagePrice: number,
    _amount: number,
    positionDirection: PositionDirection,
    optionType: OptionType) => {

    const amount = Math.abs(_amount)

    const expirePt = currency === Currency.BTC ? getOptionExpireCryptoPnl(averagePrice, strike, x, amount, optionType, positionDirection) :
        getOptionExpireUSDPnl(averagePrice, strike, x, amount, optionType, positionDirection)

    const Forward = x * Math.exp(r * t)
    const todayPtUSD = blackScholes(optionType, Forward, strike, t, r, volotility)
    const todayPt = currency === Currency.BTC ? getOptionTodayCryptoPnl(todayPtUSD, averagePrice, x, amount, optionType, positionDirection) : getOptionTodayUSDPnl(todayPtUSD, averagePrice, x, amount, optionType, positionDirection)
    return {
        expirePt: sanitizeNumber(expirePt),
        todayPt: sanitizeNumber(todayPt)
    }
}

/**
 * Calculates the pnl for an option given the price at expiry is x.
 * 
 * @param averagePrice 
 * @param strike 
 * @param x 
 * @param amount 
 * @param optionType 
 * @param positionDirection 
 * @returns The pnl for the point at expiry in usd
 */
const getOptionExpireUSDPnl = (averagePrice: number,
    strike: number,
    x: number,
    amount: number,
    optionType: OptionType,
    positionDirection: PositionDirection) => {

    if (optionType === OptionType.CALL) {
        if (positionDirection === PositionDirection.Buy) {
            return (Math.max(0, (x - strike)) - averagePrice * x) * amount
        } else {
            return x * Math.abs(amount) * averagePrice - Math.max((x - strike), 0) * Math.abs(amount)
        }
    } else {
        if (positionDirection === PositionDirection.Buy) {
            return Math.max((strike - x) * Math.abs(amount), 0) - x * Math.abs(amount) * averagePrice
        } else {
            return Math.abs(amount) * averagePrice * x - Math.max((strike - x), 0) * Math.abs(amount)
        }
    }
}

/**
 * Calculates the pnl for an option given the price at expiry is x in crypto currency.
 * 
 * @param todayPtUSD 
 * @param averagePrice 
 * @param x 
 * @param amount 
 * @param optionType 
 * @param positionDirection 
 * @returns The pnl for the point at expiry in crypto
 */
const getOptionTodayCryptoPnl = (todayPtUSD: number, averagePrice: number, x: number, amount: number, optionType: OptionType, positionDirection: PositionDirection) => {
    let res = (todayPtUSD / x - averagePrice) * amount
    if (optionType === OptionType.CALL) {
        if (positionDirection === PositionDirection.Sell) {
            return -res
        }
    } else {
        if (positionDirection === PositionDirection.Sell) {
            return -res
        }
    }
    return res
}

/**
 * Calculates the pnl for an option given the price today is x.
 * 
 * @param todayPtUSD 
 * @param averagePrice 
 * @param x 
 * @param amount 
 * @param optionType 
 * @param positionDirection 
 * @returns {number} The pnl today in usd
 */
const getOptionTodayUSDPnl = (todayPtUSD: number, averagePrice: number, x: number, amount: number, optionType: OptionType, positionDirection: PositionDirection) => {
    const res = (todayPtUSD - averagePrice * x) * amount
    if (optionType === OptionType.CALL) {
        if (positionDirection === PositionDirection.Sell) {
            return -res
        }
    } else {
        if (positionDirection === PositionDirection.Sell) {
            return -res
        }
    }
    return res
}
