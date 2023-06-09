import { useState } from 'react'
import { makeStyles } from '@material-ui/core'

import IThemeExtended from 'common/types/themeInterface'
import { selectActiveAccount } from 'store/authentication'
import { Button } from 'components/common'
import { useAppSelector } from 'common/hooks'
import UserMenu from './UserMenu'
import LoginForm from './LoginForm'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	buttonsWrapper: {
		display: 'flex',
		flexDirection: 'row',
		paddingLeft: '50px',
	},
	registerButton: {
		marginRight: '20px',
	},
}))

const User = () => {
	const styles = useStyles()
	const activeAccount = useAppSelector(selectActiveAccount)

	// login modal
	const [loginOpen, setLoginOpen] = useState(false)
	const handleOpen = () => setLoginOpen(true)
	const handleClose = () => setLoginOpen(false)

	return activeAccount ? (
		<UserMenu activeAccount={activeAccount} />
	) : (
		<div className={styles.buttonsWrapper}>
			<Button className={styles.registerButton}>Register</Button>
			<Button variant="contained" color="primary" onClick={handleOpen}>
				Log In
			</Button>
			<LoginForm open={loginOpen} handleClose={handleClose} />
		</div>
	)
}

export default User
