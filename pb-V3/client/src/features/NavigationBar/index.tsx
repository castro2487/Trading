import { AppBar, Toolbar, useTheme, makeStyles } from '@material-ui/core'

import IThemeExtended from 'common/types/themeInterface'
import { Icon } from 'components/common'
import CurrencyButtons from './CurrencyButtons'
import LinksButtons from './LinksButtons'
import User from './User'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	wrapper: {
		// border: "1px solid red",
	},
	logo: {
		width: '250px',
		height: '35px',
		marginRight: '60px',
	},
}))

const NavigationBar = () => {
	const theme = useTheme()
	const logoComponentName = theme.palette.type === 'dark' ? 'LogoThemeDark' : 'LogoThemeLight'
	const styles = useStyles()

	return (
		<AppBar position="static" elevation={0} color="transparent" className={styles.wrapper}>
			<Toolbar disableGutters>
				<Icon component={logoComponentName} className={styles.logo} />
				<CurrencyButtons />
				<LinksButtons />
				<User />
			</Toolbar>
		</AppBar>
	)
}

export default NavigationBar
