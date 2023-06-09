import { Currency, Position } from "common/types"
import { PositionDirection } from "generated/graphql"
import { sanitizeNumber } from "./calculationUtils"

// ----------------------------------------- // 
// ---------------- PUBLIC ----------------- // 
// ----------------------------------------- //

/**
 * Calculates pnl for a future over a domain. 
 * 
 * @param {number[]} domain - Array of values that represent the x axis for calculation.
 * @param {Currency} currency - Currency used for calculation
 * @param {number} r - The interest rate
 * @param {number} t - Time to expiry
 * @param {Position} position - Position that we calculate the pnl for
 * @returns {{todayLine: number[],expireLine: number[] }}
 */
export const getFuturePnlForDomain = (
    domain: number[],
    currency: Currency,
    r: number,
    t: number,
    position: Position) => {


    let todayLine: number[] = []
    let expireLine: number[] = []

    for (const x of domain) {
        const { expirePt, todayPt } = calculateFuturePointsForIndexX(currency,
            x,
            r,
            t,
            position.averagePrice,
            position.amount,
            position.direction)

        todayLine.push(todayPt)
        expireLine.push(expirePt)
    }
    return {
        todayLine,
        expireLine,
        volatilitySmile: []
    }
}

// ----------------------------------------- // 
// ---------------- PRIVATE ---------------- // 
// ----------------------------------------- //

/**
 * Calculates the pnl for a future position.
 * 
 * @param currency 
 * @param x price that we are calculating for
 * @param r interest rate
 * @param t time to expiry
 * @param averagePrice 
 * @param amount Amount is in usd for futures
 * @returns {expirePt, todayPt} Expected pnl for the price x at expiry and today.
 */
const calculateFuturePointsForIndexX = (
    currency: Currency,
    x: number,
    r: number,
    t: number,
    averagePrice: number,
    _amount: number,
    positionDirection: PositionDirection) => {

    const amount = Math.abs(_amount)

    // TODO: BTC rename to crypto
    let expirePt = currency === Currency.BTC ? (x - averagePrice) / (x * amount / averagePrice) : (x - averagePrice) * amount / averagePrice

    const exitPrice = x * Math.exp(r * t)
    let todayPt = currency === Currency.BTC ? (exitPrice - averagePrice) / (exitPrice * amount / averagePrice) : (exitPrice - averagePrice) * amount / averagePrice

    if (positionDirection === PositionDirection.Sell) {
        expirePt = -expirePt
        todayPt = -todayPt
    }

    return {
        expirePt: sanitizeNumber(expirePt),
        todayPt: sanitizeNumber(todayPt)
    }
}
