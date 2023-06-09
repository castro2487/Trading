import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountPortfolios, Currency, Instrument, Position, Ticker } from 'common/types';
import { createAction } from '@reduxjs/toolkit'
import { PortfolioType, PositionDirection, PositionType } from 'generated/graphql';
import { RootState, AppThunk } from 'store/store';
import { syncPositions } from './webSocketAPI'
import { appendAccountsPositions, clearPositions } from 'store/positionsSlice';
import { getAllInstrumentsInAccountsArray, getNonDuplicateStringsFromArrays, getPositionsByInstrument } from './webSocketUtils';
import { selectMainAccountPlatformId } from 'store/authentication';
import { getAllBooksInstruments, getOptionInstrumentParts } from 'store/storeUtils';

export interface Tickers {
    [key: string]: Ticker
}


export interface SocketState {
    ethIndex: number;
    btcIndex: number;
    tickers: Tickers;
    // instruments for which the user have positions
    instruments: string[];
    // all possible instruments from the platform
    allPossibleInstruments: Instrument[]
}

const initialState: SocketState = {
    ethIndex: 0,
    btcIndex: 0,
    tickers: {},
    instruments: [],
    allPossibleInstruments: []
};

interface UpdateIndex {
    timestamp: number;
    price: number;
    index_name: string;
}

interface UpsertPosObj {
    mainAccountPlatformId?: number
    offlinePositions: Position[]
    accountPortfolios: AccountPortfolios[]
}

export const syncPositionsAsync = createAsyncThunk(
    'websocket/updateRealPositions',
    async (upsertObj: UpsertPosObj) => {
        const response = await syncPositions(upsertObj.accountPortfolios, upsertObj.offlinePositions, upsertObj.mainAccountPlatformId)
        return response.data;
    }
);

export const webSocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        updateIndex: (state, action: PayloadAction<UpdateIndex>) => {
            // TODO: make the string type
            if (action.payload.index_name === 'eth_usd') {
                state.ethIndex = action.payload.price
            } else {
                state.btcIndex = action.payload.price
            }
        },
        updateTicker: (state, action: PayloadAction<Ticker>) => {
            // @ts-ignore
            state.tickers[action.payload.instrument] = action.payload
        },
        clearTickers: (state) => {
            state.tickers = {}
            state.instruments = []
        },
        addInstruments: (state, action: PayloadAction<string[]>) => {
            // @ts-ignore
            state.instruments = action.payload
        },
        appendInstruments: (state, action: PayloadAction<string[]>) => {
            const instrumentsSet = new Set(state.instruments)
            for (const instrument of action.payload) {
                instrumentsSet.add(instrument)
            }
            state.instruments = Array.from(instrumentsSet.values())
        },
        setAllPossibleInstruments: (state, action: PayloadAction<Instrument[]>) => {
            state.allPossibleInstruments = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(syncPositionsAsync.pending, (state) => {
                // TODO: synching state update
            })
            .addCase(syncPositionsAsync.fulfilled, (state, action) => {
                // TODO: synching state update
            });
    },
});

export const { updateIndex,
    updateTicker,
    addInstruments,
    appendInstruments,
    setAllPossibleInstruments,
    clearTickers } = webSocketSlice.actions;

// Actions that are connected with the websocket. These actions will cause a side effect
// and will send message from the socket.
export const wsConnect = createAction('WS_CONNECT')
export const wsLogin = createAction<{ email: string, password: string }>('WS_LOGIN')
export const wsLogout = createAction('WS_LOGOUT')
export const wsGetTickers = createAction<string[]>('WS_GET_TICKERS')
export const wsGetTickerForNewPosition = createAction<string>('WS_GET_TICKER_FOR_NEW_POS')
export const wsSwitchToAccount = createAction<string>('WS_SWITCH_TO_ACCOUNT')
export const wsSwitchPageOperationalCurrency = createAction<Currency>('WS_SWITCH_PAGE_CURRENCY')

// ----------------------------------------- // 
// -------------- Selectors ---------------- // 
// ----------------------------------------- //

export const selectBTCIndex = (state: RootState) => state.websocket.btcIndex
export const selectETHIndex = (state: RootState) => state.websocket.ethIndex
export const selectOptionsExpirations = (state: RootState) => {
    return state.websocket.allPossibleInstruments.filter(i => i.positionType === PositionType.Option)
}
export const selectOptionsInstruments = (state: RootState) => {
    return state.websocket.allPossibleInstruments
        .filter(i => i.positionType === PositionType.Option)
        .sort((a, b) => {

            const { strike: strikePosA, direction: directionPosA } = getOptionInstrumentParts(a.instrumentString)
            const { strike: strikePosB, direction: directionPosB } = getOptionInstrumentParts(b.instrumentString)

            return a.expirationTimestamp - b.expirationTimestamp ||
                strikePosA - strikePosB || (directionPosA === PositionDirection.Buy ? -1 : 1)
        })
}
export const selectFutureInstruments = (state: RootState) => {
    return state.websocket.allPossibleInstruments
        .filter(i => i.positionType === PositionType.Future)
        .filter(i => !i.instrumentString.includes('PERPETUAL'))
        .sort((a, b) => a.expirationTimestamp - b.expirationTimestamp)
}


// ----------------------------------------- // 
// ---------------- Thunks ----------------- // 
// ----------------------------------------- //


export const synchronizePlatformPositions = (accountsPosPlatform: any[]) => async (dispatch, getState) => {

    const mainAccountPlatformId = selectMainAccountPlatformId(getState())
    const accountPortfolios: AccountPortfolios[] = accountsPosPlatform.map(accRealPos => {
        return {
            accountPlatformId: accRealPos.uid,
            portfolios: [{
                portfolioType: PortfolioType.Real,
                name: 'Real Positions',
                equity: 0,
                uuid: accRealPos.uuid,
                positions: accRealPos.positions.map(pos => {
                    return {
                        positionType: pos.kind === 'future' ? PositionType.Future : PositionType.Option,
                        instrument: pos.instrument_name,
                        averagePrice: pos.average_price,
                        amount: pos.size,
                        direction: pos.direction === 'buy' ? PositionDirection.Buy : PositionDirection.Sell,
                    }
                })
            }]
        }
    })

    const offlinePositions = localStorage.getItem('positions') ? JSON.parse(localStorage.getItem('positions')!) : []

    const res = await dispatch(syncPositionsAsync({
        mainAccountPlatformId,
        accountPortfolios,
        offlinePositions,
    }))

    // TODO error handling !!! important

    dispatch(clearPositions())
    localStorage.removeItem('positions')

    //dispatch(preparePositionsCalculation(res.payload.data.syncPositionsForUser))
    if (res.payload){
        dispatch(preparePositionsCalculation(res.payload.data.syncPositionsForUser))
    } 
    /*    
    setTimeout(() => {
        dispatch(refreshGraphData())
    }, 500)*/
}


/**
 * Gets the value of a ticker.
 * 
 * @param ticker 
 * @returns 
 */
export const tickerValueReceived = (ticker: Ticker): AppThunk => (
    dispatch,
    getState
) => {

    dispatch(updateTicker(ticker))

    // const {
    //     positions: { accountPositions, offlineModePositions }
    // } = getState()

    // if (accountPositions.length > 0) {
    //     // positions that have same instrument with the ticket that we have recieved
    //     const positionsForInstrument = getPositionsByInstrument(ticker.instrument, accountPositions)
    //     // dispatch(addPositionsPnlsToChart(positionsForInstrument, ticker))
    // } else {
    //     /**
    //      *  TODO chart is slower to set up so adding the positions fast will result in them
    //      *  not beeing drawn. This should be solved in a correct by listening when chart loads
    //      *  without this timeout.
    //      */
    //     setTimeout(() => {
    //         // const positionsForInstrument = offlineModePositions.filter(p => p.instrument === ticker.instrument)
    //         // dispatch(addPositionsPnlsToChart(positionsForInstrument, ticker))
    //     }, 300)
    // }
};


/**
 * TODO: 
 * 
 * @param {AccountPortfolios[]} accountsPortfolios 
 * @returns 
 */
export const preparePositionsCalculation = (accountsPortfolios: AccountPortfolios[]): AppThunk => (
    dispatch,
    getState
) => {

    const {
        websocket: { tickers, allPossibleInstruments }
    } = getState()

    // We add new accounts and positions from different back end
    dispatch(appendAccountsPositions(accountsPortfolios))

    // we get the new instruments that we dont have so far
    const allPosInstruments = getAllInstrumentsInAccountsArray(accountsPortfolios)

    const instrumentsWithoutTickerData = getNonDuplicateStringsFromArrays(Object.keys(tickers), allPosInstruments)

    /**
     *  In order to calculate the volatility with sticky delta we need the volatilities for the
     * overall book. Thus we need to get ticker data for every other strike for a certain instrument. 
     */
    const allBooksInstrumentsForWhichWeHavePositions = getAllBooksInstruments(instrumentsWithoutTickerData, allPossibleInstruments.map(i => i.instrumentString))

    // TODO: Should we recalculate everything or just new positions with this instrument?
    dispatch(appendInstruments(allPosInstruments))
    dispatch(wsGetTickers(allBooksInstrumentsForWhichWeHavePositions))
};

/**
 * Same as preparePositionsCalculation but for offline positions
 * 
 * @param {AccountPortfolios[]} accountsPortfolios 
 * @returns 
 */
export const prepareOfflinePositionsCalculation = (positions: Position[]): AppThunk => (
    dispatch,
    getState
) => {

    const {
        websocket: { tickers, allPossibleInstruments }
    } = getState()

    const allPositionsInstruments = positions.map(p => p.instrument)
    const instrumentsWithoutTickerData = getNonDuplicateStringsFromArrays(Object.keys(tickers), allPositionsInstruments)

    /**
     *  In order to calculate the volatility with sticky delta we need the volatilities for the
     * overall book. Thus we need to get ticker data for every other strike for a certain instrument. 
     */
    const allBooksInstrumentsForWhichWeHavePositions = getAllBooksInstruments(instrumentsWithoutTickerData, allPossibleInstruments.map(i => i.instrumentString))

    // TODO: Should we recalculate everything or just new positions with this instrument?
    dispatch(appendInstruments(allPositionsInstruments))
    dispatch(wsGetTickers(allBooksInstrumentsForWhichWeHavePositions))
};

export default webSocketSlice.reducer;
