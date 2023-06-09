import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import { store } from './store/store'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'
import { SciChartSurface } from 'scichart/Charting/Visuals/SciChartSurface'
import { setContext } from '@apollo/client/link/context'

import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

import { wsConnect } from 'services/webSocketSlice'

SciChartSurface.setRuntimeLicenseKey(process.env.REACT_APP_SCI_CHART_LICENCE_KEY!)

const httpLink = createHttpLink({
	uri: process.env.REACT_APP_GRAPHQL_URL,
})

const authLink = setContext((_, { headers }) => {
	// get the authentication token from local storage if it exists
	// return the headers to the context so httpLink can read them
	return {
		headers: {
			...headers,
			// TODO This is account platform id instead of user
			accountId: sessionStorage.getItem('userPlatformId'),
		},
	}
})

// SciChartSurface.setRuntimeLicenseKey(
// 	'altaKgublgqxhluB8QOeUjy407/BVY6esESvqmB+nnS8ACaz2lREZqLXun2H4G5NDXFVHlmRx1IHnS85B0HOIeVDDVOZ72nqubuosb4KQ8Pt4QT/AoycXhk2X8DLno/h+IPh+L3lG1dkF223gIqBzOSeOyNiL1PRohHpocga384zuMfkt4zPsVsWiYTkMtHzCSsobmdXLIhkzrKE6IMK8l7Ztolk7VgFpMES4Uc1k7sjuRbCYaVtH0QYBam0P6+DL39BmTrTHh+zEgE4zPGvLDTd7FAiyXe7CLWPo021/JJ+VEBNWE27qEoXNrpNxIhT0538n4CIwm03lda72IRITV+5ToxozM6U6Ma2arzZSP3Hs+7Z1M34vGnCp0jV1PKUzfkqpB1PPru6ai2ow9IASJYZtSoDlKov4TzIffAYbXR6639g2o1ddGfD6hiyEJH1LNj1aOrSA91cw5B7CU3wI5Gduqp3VwjfSP75I+eLeSpkd3CvwzqlFnLXzOzAJyrVXCXvEshGWvPmtlbv76dbf/tdJ3t7AnTS39kZl1xfhWNabUVz48lnLI+pJ2yxmXtCUMeUEdVGVAxy/wRt+ZegpnkyrFpepnVvQ/c2GQJGkMR8BDjYDS9ogK4XEkfqr0LslUDTpT2Jn7MPhPNVWJCg0N0El/l3Kb7d1Tu/JFfHn3IT3ELseajVoMN7JkDNU8W4HX4syRTo5qvYwBkZFyGfgnJJcQMwtoGn52nw'
// )

// const httpLink = createHttpLink({
// 	uri: 'http://localhost:4001/graphql',
// })

// const authLink = setContext((_, { headers }) => {
// 	// get the authentication token from local storage if it exists
// 	// return the headers to the context so httpLink can read them
// 	return {
// 		headers: {
// 			...headers,
// 			accountId: sessionStorage.getItem('userPlatformId'),
// 		},
// 	}
// })

export const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
})

store.dispatch(wsConnect())

ReactDOM.render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<Provider store={store}>
				<App />
			</Provider>
		</ApolloProvider>
	</React.StrictMode>,
	document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
