import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store/store';
import { Currency, GraphDomain, ImpliedVolatilityType } from 'common/types';
import { clearTickers, wsSwitchPageOperationalCurrency } from 'services/webSocketSlice';
import { clearPositions } from './positionsSlice';

export interface SettingsState {
	pageOperationCurrency: Currency,
	graphCalculationCurrency: Currency,
	graphDomain: GraphDomain,
	timestamp: number,
	impliedVolatilityCalculationType: ImpliedVolatilityType
}

const initialState: SettingsState = {
	pageOperationCurrency: Currency.BTC,
	graphCalculationCurrency: Currency.USD,
	graphDomain: {
		x: {
			start: 10000,
			end: 100000
		},
		y: {
			start: 0,
			end: 100000
		}
	},
	timestamp: new Date().valueOf(),
	impliedVolatilityCalculationType: ImpliedVolatilityType.STICKY_DELTA
};

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setPageOperationCurrency: (state, action: PayloadAction<Currency>) => {
			state.pageOperationCurrency = action.payload
		},
		setGraphCalculationCurrency: (state, action: PayloadAction<Currency>) => {
			state.graphCalculationCurrency = action.payload
		},
		setDomain: (state, action: PayloadAction<GraphDomain>) => {
			state.graphDomain = action.payload
		},
		setImpliedVolatilityType: (state, action: PayloadAction<ImpliedVolatilityType>) => {
			state.impliedVolatilityCalculationType = action.payload
		},
	},
});

export const { setPageOperationCurrency, setGraphCalculationCurrency, setDomain, setImpliedVolatilityType } = settingsSlice.actions;
export const selectCurrency = (state: RootState) => state.settings.pageOperationCurrency;
export const selectDomain = (state: RootState) => state.settings.graphDomain;
export const selectGraphCalculationCurrency = (state: RootState) => state.settings.graphCalculationCurrency;
export const selectImpliedVolatilityType = (state: RootState) => state.settings.impliedVolatilityCalculationType;

/**
 * The page operation currency is changed. We need to clear the state and get the new currency
 * positions. 
 * 
 * @param currency 
 * @returns 
 */
export const changeOperationCurrency = (currency: Currency) => async (dispatch, getState) => {
	dispatch(setPageOperationCurrency(currency))
	dispatch(clearTickers())
	dispatch(clearPositions())
	dispatch(wsSwitchPageOperationalCurrency(currency))
}

export default settingsSlice.reducer;