import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountType } from 'common/types';

import { RootState } from 'store/store';

export interface Account {
    accountPlatformId: number;
    email: string;
    accountType: AccountType;
    username: string;
}

export interface SettingsState {
    activeAccount?: Account;
    allAccounts: Account[]
    tmpPassword: string;
}

const initialState: SettingsState = {
    activeAccount: undefined,
    allAccounts: [],
    tmpPassword: ''
};

export const settingsSlice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
        setActiveAccount: (state, action: PayloadAction<Account>) => {
            if (action.payload.accountPlatformId === 0) {
                state.activeAccount = undefined;
            }
            else {
                state.activeAccount = action.payload
                // Remove sideeffect
                sessionStorage.setItem('userPlatformId', `${action.payload.accountPlatformId}`)
            }
        },
        setAccounts: (state, action: PayloadAction<Account[]>) => {
            state.allAccounts = action.payload
        },
        setTmpPassword: (state, action: PayloadAction<string>) => {
            state.tmpPassword = action.payload
        },
    },
});

export const { setActiveAccount, setAccounts, setTmpPassword } = settingsSlice.actions;

export const selectActiveAccount = (state: RootState) => state.authentication.activeAccount;
export const selectAllAccounts = (state: RootState) => state.authentication.allAccounts;
export const selectMainAccountPlatformId = (state: RootState) => state.authentication.allAccounts
    .find(account => account.accountType === AccountType.MAIN)?.accountPlatformId;


export default settingsSlice.reducer;