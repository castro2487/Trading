import { PortfolioType, PositionDirection, PositionType } from "generated/graphql";

export enum OptionType {
    CALL = 'CALL',
    PUT = 'PUT'
}


export enum ImpliedVolatilityType {
    STICKY_STRIKE = "STICKY_STRIKE",
    STICKY_DELTA = "STICKY_DELTA",
}
export interface Position {
    id?: string;
    instrument: string;
    averagePrice: number;
    amount: number;
    direction: PositionDirection;
    positionType: PositionType,
}

export interface PositionWithTicker {
    position: Position;
    ticker: Ticker;
}

export enum Currency {
    BTC = 'BTC',
    ETH = 'ETH',
    USD = 'USD'
}

export type Asset = 'BTC' | 'ETH'

// TODO: make it a class so we have a construcur and toString
export interface OptionInstrument {
    underlayingAsset: Asset;
    dateOfExpiration: Date;
    strike: number;
    type: OptionType;
}
export interface FutureInstrument {
    underlayingAsset: Asset;
    dateOfExpiration: Date;
}

// TODO move to BE
export enum AccountType {
    MAIN = 'main',
    SUBACCOUNT = 'subaccount'
}

export interface Portfolio {
    portfolioType: PortfolioType
    positions: Position[]
    uuid: string
    name?: string
}
export interface AccountPortfolios {
    accountPlatformId: number;
    portfolios: Portfolio[]
}

export interface Ticker {
    indexPrice: number
    instrument: string
    markPrice: number
    underlyingPrice?: number,
    volatility?: number
}

export interface GraphLine {
    values: number[];
    min: number;
    max: number;
    root?: number;
    closestIndexToRoot?: number
}
export interface ChartLines {
    todayLine: GraphLine,
    expireLine: GraphLine,
    volatilitySmile?: number[]
}

export interface GraphDomain {
    x: {
        start: number,
        end: number
    },
    y: {
        start: number,
        end: number
    }
}


export interface InstrumentStringParts {
    strike: string
}

export interface Instrument {
    instrumentString: string,
    positionType: PositionType,
    expirationTimestamp: number
}