import { setAllPossibleInstruments, synchronizePlatformPositions, tickerValueReceived, updateIndex, wsConnect, wsGetTickerForNewPosition, wsGetTickers, wsLogin, wsLogout, wsSwitchPageOperationalCurrency, wsSwitchToAccount } from "./webSocketSlice";
import srp, { shortUniqueID } from './srpCryptoUtils';
import { setAccounts, setActiveAccount, setTmpPassword } from "store/authentication";
import { finalizeNewPosition, initializeUnauthenticatedPositions } from "store/positionsSlice";
import { Account } from 'store/authentication'
import { PositionType } from "generated/graphql";

// TODO: add error handling and the other callbacks
export const messagesMap = {
    GET_SRP: {
        method: 'public/login',
        id: 1,
        params: {
            request: 'hello'
        }
    },
    AUTHENTICATE: {
        method: 'public/login',
        id: 2,
        params: {
            request: 'authenticate'
        }
    },
    SUBSCRIBE_TO_INDICES: {
        method: 'public/subscribe',
        id: 3,
        params: {
            channels: ['deribit_price_index.eth_usd', 'deribit_price_index.btc_usd']
        }
    },
    GET_ALL_INSTRUMENTS: {
        method: 'public/get_instruments',
        id: 4,
        params: {}
    },
    BIND_ACCESS_TOKEN: {
        method: 'public/bind_access_token',
        id: 5,
        params: {}
    },
    GET_ACCOUNT_SUMMARY: {
        method: 'private/get_account_summary',
        id: 6,
        params: {
            extended: true
        }
    },
    LOGIN_TO_SUBACCOUNT: {
        method: '/public/exchange_token',
        id: 7,
        params: {}
    },
    GET_SUBBACOUNTS: {
        method: '/private/get_subaccounts',
        id: 8,
        params: {}
    },
    GET_TICKER_VALUE: {
        method: 'public/ticker',
        id: 9,
        params: {
            // example
            // instrument_name: "BTC-24SEP21-11000-P"
        }
    },
    GET_SUBACCOUNTS_DETAILS: {
        method: 'private/get_subaccounts_details',
        id: 10,
        params: {}
    },
    GET_TICKER_NEW_POSITION: {
        method: 'public/ticker',
        id: 11,
        params: {
            currency: "btc"
        }
    },
    FORK_TOKEN: {
        method: 'public/fork_token',
        id: 12,
        params: {}
    },
}


const socketMiddleware = () => {
    let socket: WebSocket;

    const sendMessage = (requestIdentifiers: { method: string, id: any, params: {} }, params = {}) => {
        const data = {
            jsonrpc: '2.0',
            method: requestIdentifiers.method,
            id: requestIdentifiers.id,
            params: {
                ...requestIdentifiers.params,
                ...params
            }
        }
        socket.send(JSON.stringify(data))
    }

    const subscriptions = {}

    const callbacksMap = {
        1: store => data => {
            const { N, g, I, s, B } = data.result;
            const { authentication: { tmpPassword: password } } = store.getState()
            const { A, M1 } = srp.generateClientKeys(I, password, N, g, s, B);
            sendMessage(messagesMap['AUTHENTICATE'], { scope: `session:${shortUniqueID()}`, tfa: '', A, M1 })
        },
        2: store => data => {
            sessionStorage.setItem('refreshToken', data.result.refresh_token)
            sessionStorage.setItem('sessionName', shortUniqueID())
            store.dispatch(setTmpPassword(''))
            sendMessage(messagesMap['BIND_ACCESS_TOKEN'], { access_token: data.result.access_token })
        },
        3: store => data => {
            data.result.forEach(indexChannel => {
                subscriptions[indexChannel] = callData => {
                    store.dispatch(updateIndex(callData))
                }
            });
        },
        4: store => data => {
            store.dispatch(setAllPossibleInstruments(data.result.map(i => {
                return {
                    instrumentString: i.instrument_name,
                    positionType: i.kind === 'option' ? PositionType.Option : PositionType.Future,
                    expirationTimestamp: i.expiration_timestamp
                }
            })))
            store.dispatch(initializeUnauthenticatedPositions())
        },
        // Successful authentication
        5: store => data => {
            sendMessage(messagesMap['GET_ACCOUNT_SUMMARY'], { currency: 'BTC' })
        },
        6: store => data => {

            const accountPlatformId = data.result.id

            store.dispatch(setActiveAccount({
                accountPlatformId,
                email: data.result.email,
                accountType: data.result.type,
                username: data.result.username
            }))

            const { settings: pageOperationCurrency } = store.getState()
            sendMessage(messagesMap['GET_SUBBACOUNTS'], { currency: pageOperationCurrency })
        },
        // LOGIN to subaccount
        7: store => data => {
            sessionStorage.setItem('refreshToken', data.result.refresh_token)

            const { settings: pageOperationCurrency } = store.getState()
            sendMessage(messagesMap['GET_ACCOUNT_SUMMARY'], { currency: pageOperationCurrency })
        },
        // GET_SUBBACOUNTS
        // BUG in the endpoint. If we login with subaccount we get the main account info as well with id and
        // stuff. I did not check if we can login to the main account. If we can that is severe.
        8: store => data => {
            store.dispatch(setAccounts(data.result.map(acc => {
                return {
                    email: acc.email,
                    username: acc.username,
                    accountPlatformId: acc.id,
                    accountType: acc.type
                }
            })))

            const { settings: { pageOperationCurrency } } = store.getState()
            sendMessage(messagesMap['GET_SUBACCOUNTS_DETAILS'], { currency: pageOperationCurrency })
        },
        // GET_TICKER
        9: store => data => {
            if (data.result) {
                store.dispatch(tickerValueReceived({
                    indexPrice: data.result.index_price,
                    instrument: data.result.instrument_name,
                    markPrice: data.result.mark_price,
                    underlyingPrice: data.result.underlying_price,
                    volatility: data.result.mark_iv
                }))
            }
        },
        // GET_SUBACCOUNTS_DETAILS
        10: store => data => {
            store.dispatch(synchronizePlatformPositions(data.result))
        },
        11: store => data => {
            store.dispatch(finalizeNewPosition({
                indexPrice: data.result.index_price,
                instrument: data.result.instrument_name,
                markPrice: data.result.mark_price,
                underlyingPrice: data.result.underlying_price,
                volatility: data.result.mark_iv
            }
            ))
        },
        12: store => data => {
            if (data.result) {
                sendMessage(messagesMap['BIND_ACCESS_TOKEN'], { access_token: data.result.access_token })
                sessionStorage.setItem('refreshToken', data.result.refresh_token)
            }
        },
    }

    /**
     *  After we are connected we can start communicating with the platform
     *  This is a good place for starting subscriptions and getting tickers 
     *  for unauthenticated positions 
     */
    const onOpen = store => event => {
        const refreshToken = sessionStorage.getItem('refreshToken')
        if (refreshToken) {
            sendMessage(messagesMap['FORK_TOKEN'], {
                session_name: shortUniqueID(),
                refresh_token: refreshToken
            })
        }

        const { settings: { pageOperationCurrency } } = store.getState()

        // sendMessage(messagesMap['SUBSCRIBE_TO_INDICES'])
        sendMessage(messagesMap['GET_ALL_INSTRUMENTS'], { currency: pageOperationCurrency })
    };

    // const onClose = store => () => {
    //     // store.dispatch();
    // };

    const onMessage = store => (event) => {
        // ERRORS
        const socketResponse = JSON.parse(event.data)
        if (socketResponse.id) {
            callbacksMap[socketResponse.id](store)(socketResponse)
        } else if (socketResponse.method === 'subscription') {
            subscriptions[socketResponse.params.channel](socketResponse.params.data)
        }
    };

    return store => next => (action) => {
        switch (action.type) {
            case wsConnect.type:
                if (socket) {
                    socket.close()
                }
                socket = new WebSocket(process.env.REACT_APP_PLATFORM_WS_URL || '');
                // websocket handlers
                socket.onmessage = onMessage(store);
                // socket.onclose = onClose(store);
                socket.onopen = onOpen(store);
                break;
            case 'WS_DISCONNECT':
                if (socket !== null) {
                    socket.close();
                }
                break;
            case wsLogin.type:
                store.dispatch(setTmpPassword(action.payload.password))
                sendMessage(messagesMap['GET_SRP'], { email: action.payload.email })
                break;
            case wsLogout.type:
                // sendMessage logout
                store.dispatch(setActiveAccount({ accountPlatformId: 0 } as Account))
                store.dispatch(setAccounts([]))
                sessionStorage.clear()
                break;
            case wsGetTickers.type:
                action.payload.forEach(instrument => {
                    sendMessage(messagesMap['GET_TICKER_VALUE'], { instrument_name: instrument })
                })
                break;
            case wsGetTickerForNewPosition.type:
                sendMessage(messagesMap['GET_TICKER_NEW_POSITION'], { instrument_name: action.payload })
                break;
            case wsSwitchToAccount.type:
                sendMessage(messagesMap['LOGIN_TO_SUBACCOUNT'], { subject_id: action.payload, refresh_token: sessionStorage.getItem('refreshToken') })
                break;
            case wsSwitchPageOperationalCurrency.type:
                sendMessage(messagesMap['GET_ALL_INSTRUMENTS'], { currency: action.payload })
                sendMessage(messagesMap['GET_SUBBACOUNTS'], { currency: action.payload })
                break;
            default:
                return next(action);
        }
    };
};

export default socketMiddleware();