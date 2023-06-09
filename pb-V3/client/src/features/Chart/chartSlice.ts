import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getPnlForPositionsOverDomain } from 'common/calculationsCore';
import { getXAxisValues } from 'common/calculationsCore/calculationUtils';
import { ChartLines, Currency, Position, Ticker } from 'common/types';
import { setDomain, setGraphCalculationCurrency } from 'store/settingsSlice';
import { RootState, AppThunk } from 'store/store';
import { getAllPositions } from 'store/storeUtils';


export interface ChartState {
    chartLines: ChartLines;
    xAxisValues: number[];
    volotilitySmile: number[] | null;
}

const X_AXIS_MIN_VALUE = process.env.REACT_APP_X_AXIS_MIN || 10000
const X_AXIS_MAX_VALUE = process.env.REACT_APP_X_AXIS_MAX || 400000
const X_AXIS_STEP = process.env.REACT_APP_X_AXIS_STEP || 1

const initialState: ChartState = {
    chartLines: {
        expireLine: {
            max: 0,
            min: 0,
            root: 0,
            values: []
        },
        todayLine: {
            max: 0,
            min: 0,
            root: 0,
            values: []
        },
    },
    volotilitySmile: [],
    //@ts-ignore
    xAxisValues: getXAxisValues(parseInt(X_AXIS_MIN_VALUE), parseInt(X_AXIS_MAX_VALUE), parseInt(X_AXIS_STEP)),
};

export const chartSlice = createSlice({
    name: 'graphSlice',
    initialState,
    reducers: {
        // updateChartLines: (state, action: PayloadAction<GraphLines>) => {
        //     state.expireLine = action.payload.expireLine
        //     state.todayLine = action.payload.todayLine
        //     state.volotilitySmile = action.payload.volotilitySmile
        //     state.xAxisValues = action.payload.xAxisValues
        // }
        updateChartLines: (state, action: PayloadAction<ChartLines>) => {
            state.chartLines.expireLine.values = action.payload.expireLine.values
            state.chartLines.todayLine.values = action.payload.todayLine.values
            state.volotilitySmile = action.payload.volatilitySmile ? action.payload.volatilitySmile : state.volotilitySmile
        }
    },
});

export const { updateChartLines } = chartSlice.actions;

export const selectGraphData = (state: RootState): ChartState => state.graphData

// Thunks
export const currencyUpdated = (currency: Currency): AppThunk => (
    dispatch,
    getState
) => {
    dispatch(setGraphCalculationCurrency(currency))
    dispatch(refreshGraphData())
};

// TODO
export const refreshGraphData = (explicitTimestamp?: number) => async (dispatch, getState) => {
    // export const refreshGraphData = (explicitTimestamp?: number): AppThunk => (
    //     dispatch,
    //     getState
    // ) => {

    const {
        positions: { accountPositions, offlineModePositions },
        settings: { graphCalculationCurrency, timestamp, impliedVolatilityCalculationType },
        websocket: { tickers },
        graphData: { xAxisValues, chartLines } } = getState()

    const allPositions = getAllPositions(accountPositions, offlineModePositions)

    const res = await getPnlForPositionsOverDomain(xAxisValues,
        allPositions,
        tickers,
        graphCalculationCurrency,
        impliedVolatilityCalculationType,
        explicitTimestamp)

    dispatch(setDomain({
        x: {
            start: 0,
            end: 100000
        },
        y: {
            start: Math.min(res.expireLine.min, res.todayLine.min),
            end: Math.max(res.expireLine.max, res.todayLine.max)
        }
    }))

    dispatch(updateChartLines(res))
};

/**
 * TODO: Multiple. positions update
 * 
 * @param position 
 * @param ticker 
 * @returns 
 */
export const addPositionsPnlsToChart = (positions: Position[], ticker: Ticker): AppThunk => (
    dispatch,
    getState
) => {

    const {
        graphData: { chartLines, xAxisValues },
        settings: { graphCalculationCurrency },
    } = getState()

    // Does not work corectly
    // const res = getChartLinesAfterAddingPositions(xAxisValues, chartLines, positions, ticker, graphCalculationCurrency)
    // dispatch(updateChartLines(res))
};

/**
 * TODO: Multiple.
 * 
 * @param position 
 * @param ticker 
 * @returns 
 */
export const addPositionPnlToChart = (position: Position, ticker: Ticker): AppThunk => (
    dispatch,
    getState
) => {

    // const {
    //     graphData: { chartLines, xAxisValues },
    //     settings: { graphCalculationCurrency },
    // } = getState()

    // const res = getChartLinesAfterAddingPosition(xAxisValues, chartLines, position, ticker, graphCalculationCurrency)
    // dispatch(setDomain({
    //     x: {
    //         start: 0,
    //         end: 100000
    //     },
    //     y: {
    //         start: Math.min(res.expireLine.min, res.todayLine.min),
    //         end: Math.max(res.expireLine.max, res.todayLine.max)
    //     }
    // }))
    // dispatch(updateChartLines(res))
};

/**
 * TODO: Multiple.
 * 
 * @param position 
 * @param ticker 
 * @returns 
 */
export const calculateSinglePoint = (pricePoint: number): AppThunk => (
    dispatch,
    getState
) => {

    const {
        positions: { accountPositions, offlineModePositions },
        settings: { graphCalculationCurrency, impliedVolatilityCalculationType },
        websocket: { tickers } } = getState()

    const allPositions = getAllPositions(accountPositions, offlineModePositions)

    const res = getPnlForPositionsOverDomain([pricePoint],
        allPositions,
        tickers,
        graphCalculationCurrency,
        impliedVolatilityCalculationType)

    // TODO Can have its own UI
    console.log({ res });
    console.log({ tickers });
    console.log({ allPositions });
    console.log({ graphCalculationCurrency });
};

export default chartSlice.reducer;
