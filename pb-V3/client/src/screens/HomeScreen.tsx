import { makeStyles } from '@material-ui/core'

import IThemeExtended from 'common/types/themeInterface'
import {
	NavigationBar,
	UserStatsBar,
	PositionCreator,
	PortfoliosToolbar,
	PortfoliosTable,
	ChartContainer,
} from 'features'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	wrapper: {
		backgroundColor: theme.palette.background.default,
		color: theme.palette.common.contrastText,
		padding: theme.spacing(6),
		paddingTop: theme.spacing(4),
	},
}))

const HomeScreen = () => {
	const styles = useStyles()

	return (
		<div className={styles.wrapper}>
			<NavigationBar />
			<UserStatsBar />
			<div className="klasa">
				<PositionCreator />
				<ChartContainer />
			</div>
			<PortfoliosToolbar />
			<PortfoliosTable />
		</div>
	)
}

export default HomeScreen
