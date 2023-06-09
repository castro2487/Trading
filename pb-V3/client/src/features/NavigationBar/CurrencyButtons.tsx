import { makeStyles, Button, Box } from '@material-ui/core'
import { Link } from 'react-router-dom'

import { Currency } from 'common/types'
import IThemeExtended from 'common/types/themeInterface'
import { CurrencyIcon } from 'components'
import { selectBTCIndex, selectETHIndex } from 'services/webSocketSlice'
import { useAppSelector, useAppDispatch } from 'common/hooks'
import { changeOperationCurrency, selectCurrency, setPageOperationCurrency } from 'store/settingsSlice'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	button: {
		display: 'flex',
		alignItems: 'center',
		padding: '3px 10px',
		marginRight: theme.spacing(4),
		borderRadius: 25,
		backgroundColor: theme.palette.action.hover,
		color: theme.palette.secondary.main,
		border: `1px solid ${theme.palette.divider}`,
	},
	buttonSelected: {
		color: theme.palette.common.contrastText,
		backgroundColor: theme.palette.background.paper,
	},
	currency: {
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(2),
	},
	index: {},
}))

const NavigationTab = ({
	currency,
	index,
	selected,
	action,
}: {
	currency: Currency
	index: number
	selected: boolean
	action: () => void
}) => {
	const stylesNavigationTab = useStyles()
	return (
		<Button
			disableRipple
			disableTouchRipple
			component={Link}
			to={`/${currency}`}
			className={`${stylesNavigationTab.button} ${selected ? stylesNavigationTab.buttonSelected : null}`}
			onClick={action}
		>
			<CurrencyIcon currency={currency} style={{ width: '20px', height: '20px' }} />
			<Box component="span" className={stylesNavigationTab.currency}>
				{currency}
			</Box>
			<Box component="span" className={stylesNavigationTab.index}>
				{index.toFixed(2)}
			</Box>
		</Button>
	)
}

const CurrencyButtons = () => {
	const btcIndex = useAppSelector(selectBTCIndex)
	const ethIndex = useAppSelector(selectETHIndex)
	const selectedCurrency = useAppSelector(selectCurrency)
	const dispatch = useAppDispatch()

	return (
		<Box display="flex" alignItems="center">
			<NavigationTab
				currency={Currency.BTC}
				index={btcIndex}
				selected={selectedCurrency === Currency.BTC ? true : false}
				action={() => dispatch(changeOperationCurrency(Currency.BTC))}
			/>
			<NavigationTab
				currency={Currency.ETH}
				index={ethIndex}
				selected={selectedCurrency === Currency.ETH ? true : false}
				action={() => dispatch(changeOperationCurrency(Currency.ETH))}
			/>
		</Box>
	)
}

export default CurrencyButtons
