/*
  PutCallFlag: Either "put" or "call"
  S: Stock Price
  X: Strike Price
  T: Time to expiration (in years)
  r: Risk-free rate
  v: Volatility
  Taken from http://www.espenhaug.com/black_scholes.html
*/

import { OptionType } from "common/types";


export const blackScholes = (optionType: OptionType, St: number, K: number, timeToExpiry: number, r: number, v: number) => {
    // console.log(PutCallFlag, S, X, T, r, v);
    const d1 = (Math.log(St / K) + (r + (v * v) / 2) * timeToExpiry) / (v * Math.sqrt(timeToExpiry));
    const d2 = d1 - v * Math.sqrt(timeToExpiry);
    const ert = Math.exp(-r * timeToExpiry);

    if (optionType === OptionType.CALL) {
        return St * CND(d1) - K * ert * CND(d2);
    } else {
        return K * ert * CND(-d2) - St * CND(-d1);
    }
};

/* The cummulative Normal distribution function: */
const CND = (x: number): number => {
    if (x < 0) {
        return 1 - CND(-x);
    } else {
        const k = 1 / (1 + 0.2316419 * x);
        return (
            1 -
            (Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)) *
            k *
            (0.31938153 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429))))
        );
    }
}
