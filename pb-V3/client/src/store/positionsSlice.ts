import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from './store';
import { AccountPortfolios, Position, Ticker } from 'common/types';
import { merge } from 'lodash';
import { prepareOfflinePositionsCalculation, preparePositionsCalculation, updateTicker, wsGetTickerForNewPosition, wsGetTickers } from 'services/webSocketSlice';
import { refreshGraphData } from 'features/Chart/chartSlice';
import { addSimulatedPosition, getPositionsForAccount } from './positionsAPI';
import { getInstrumenentsFromPositionsWithoutDuplications } from 'services/webSocketUtils';
import { getAllPositions, getExpirations } from './storeUtils';
import { PositionType } from 'generated/graphql';

export interface PositionState {
  accountPositions: AccountPortfolios[];
  offlineModePositions: Position[];
  partialTmpPosition: Partial<Position>;
}

const positionsStorage = localStorage.getItem('positions')
let unauthenticatedPositions = [];
if (positionsStorage) {
  unauthenticatedPositions = JSON.parse(positionsStorage)
}

const initialState: PositionState = {
  accountPositions: [],
  offlineModePositions: [...unauthenticatedPositions],
  partialTmpPosition: {}
};

/**
 * Section for async thunks used for making api calls
 */

export const addSimulatedPositionAsync = createAsyncThunk(
  'websocket/addSimulatedPosition',
  async (position: Position) => {
    const response = await addSimulatedPosition(position)
    return response;
  }
);

export const getPBPositionsByAccountPlatformIdAsync = createAsyncThunk(
  'websocket/getPBPostitionByAccountPlatformId',
  async (accountPlatformId: string) => {
    const response = await getPositionsForAccount(accountPlatformId)
    return response.data;
  }
);

/**
 * Section for the main slice.
 */

export const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    expandAccountsWithPositions: (state, action: PayloadAction<AccountPortfolios[]>) => {
      state.accountPositions = merge(state.accountPositions, action.payload)
    },
    setAccountsPositions: (state, action: PayloadAction<AccountPortfolios[]>) => {
      state.accountPositions = action.payload
      console.log(action.payload)
    },
    // TODO offline -> unauthenticated
    addOfflineModePosition: (state, action: PayloadAction<Position>) => {
      state.offlineModePositions = [...state.offlineModePositions, action.payload]
    },
    addTmpPartialPosition: (state, action: PayloadAction<Partial<Position>>) => {
      state.partialTmpPosition = action.payload
    },
    clearPositions: (state) => {
      state.accountPositions = []
      state.offlineModePositions = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSimulatedPositionAsync.pending, (state) => {
        // TODO: synching state update
      })
      .addCase(addSimulatedPositionAsync.fulfilled, (state, action) => {
        const uuidOfPortfolioWherePositionWasAdded = action.payload.data.createPosition.uuid
        state.accountPositions = state.accountPositions.map(ap => {
          return {
            ...ap,
            portfolios: ap.portfolios.map(p => {
              if (p.uuid === uuidOfPortfolioWherePositionWasAdded) {
                return {
                  ...p,
                  positions: [...p.positions, action.meta.arg]
                }
              }
              return {
                ...p
              }
            })
          }
        })
      })
      .addCase(getPBPositionsByAccountPlatformIdAsync.fulfilled, (state, action) => {

      });
  },
});

export const { expandAccountsWithPositions,
  setAccountsPositions,
  addOfflineModePosition,
  addTmpPartialPosition,
  clearPositions } = positionsSlice.actions;

export const selectExpirations = (state: RootState) => {
  const allPositions = getAllPositions(state.positions.accountPositions, state.positions.offlineModePositions);
  const expirations = getExpirations(allPositions)
    .map(eDate => eDate.valueOf())

  const set = new Set(expirations)
  const res = Array.from(set)
  return res
}

export const selectAllPositions = (state: RootState ) => {
  const allPositions = getAllPositions(state.positions.accountPositions, state.positions.offlineModePositions);
  return allPositions
}
export const selectAllAvailablePositions = (state: RootState) => {
  const allAvailablePositions = [state.positions.accountPositions, state.positions.offlineModePositions]
  return allAvailablePositions
}

/**
* Section for mixed thunks. They have some async and sync logic.
*/

/**
 * TODO
 * 
 * @param partialAccWithPos 
 * @returns 
 */
export const appendAccountsPositions = (partialAccWithPos: AccountPortfolios[]): AppThunk => (
  dispatch,
  getState
) => {

  //   const {
  //     positions: { accountPositions }
  //   } = getState()

  // new pos tree merge
  // const newPositionsTree = merge(partialAccWithPos, accountPositions)
  dispatch(setAccountsPositions(partialAccWithPos))
};

/**
 * TODO
 * 
 * @param accountPlatformId 
 * @returns 
 */
export const getPBPositionsByAccountPlatformId = () => async (dispatch) => {

  // TODO: 
  const accountPlatformId = sessionStorage.getItem('userPlatformId')

  // Not needed if we do it when we sync positions
  if (accountPlatformId) {
    const res = await dispatch(getPBPositionsByAccountPlatformIdAsync(accountPlatformId))
    if (!res.error) {
      const portfolios = res.payload.portfoliosByUser
      dispatch(preparePositionsCalculation(portfolios))

      // TODO: jsut test. Important Remove !!! 
      setTimeout(() => {
        // dispatch(refreshGraphData())
      }, 1000)
    }
  }

}

/**
 * TODO
 * 
 * @param accountPlatformId 
 * @returns 
 */
export const finalizeNewPosition = (ticker: Ticker) => async (dispatch, getState) => {

  const {
    positions: { partialTmpPosition }
  } = getState()

  const position: Position = {
    averagePrice: ticker.markPrice,
    // Future amount is in USD
    amount: partialTmpPosition.positionType === PositionType.Future ? partialTmpPosition.amount! * ticker.indexPrice : partialTmpPosition.amount!,
    direction: partialTmpPosition.direction!,
    instrument: partialTmpPosition.instrument!,
    positionType: partialTmpPosition.positionType!,
  }

  dispatch(updateTicker(ticker))

  // TODO: change to state property. We check if we are logged in
  const accountPlatformId = sessionStorage.getItem('userPlatformId')

  if (accountPlatformId) {
    await dispatch(addSimulatedPositionAsync(position))
    // dispatch(addPositionPnlToChart(position, ticker))
  } else {
    // We add position in localStorage since we are not logged in.
    const offlinePositionsString = localStorage.getItem('positions')
    if (offlinePositionsString) {
      localStorage.setItem('positions', JSON.stringify([...JSON.parse(offlinePositionsString), position]))
    } else {
      localStorage.setItem('positions', JSON.stringify([position]))
    }

    dispatch(addOfflineModePosition(position))
  }
}

export const createSimulatedPosition = (position: Partial<Position>): AppThunk => (
  dispatch,
  getState
) => {
  dispatch(addTmpPartialPosition(position))
  dispatch(wsGetTickerForNewPosition(position.instrument!))
};

// TODO
export const initializeUnauthenticatedPositions = (): AppThunk => (
  dispatch,
  getState
) => {
  const { positions: { offlineModePositions } } = getState()

  dispatch(prepareOfflinePositionsCalculation(offlineModePositions))
};

export default positionsSlice.reducer;
