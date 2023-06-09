import { useState } from 'react'
import {
	Avatar,
	makeStyles,
	Menu,
	MenuItem,
	Box,
	IconButton,
	List,
	ListItemText,
	ListItemIcon,
	Radio,
	Chip,
} from '@material-ui/core'
import { ExitToApp } from '@material-ui/icons'

import IThemeExtended from 'common/types/themeInterface'
import { useAppSelector, useAppDispatch } from 'common/hooks'
import { wsSwitchToAccount, wsLogout } from 'services/webSocketSlice'
import { selectAllAccounts } from 'store/authentication'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	avatarIconButton: {
		color: theme.palette.common.contrastText,
		backgroundColor: theme.palette.background.dialog,
		fontSize: '13px',
	},
	menu: {
		borderRadius: '6px',
		border: `1px solid ${theme.palette.border.main}`,
		width: '260px',
		marginTop: '80px',
		marginRight: '140px',
		backgroundColor: theme.palette.background.dialog,
	},
	avatarIconWrapper: {
		paddingTop: theme.spacing(0.5),
		paddingBottom: theme.spacing(3),
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'column',
		borderBottom: `1px solid ${theme.palette.border.main}`,
	},
	avatarIcon: {
		fontSize: '13px',
		color: theme.palette.common.contrastText,
		backgroundColor: theme.palette.background.paper,
	},
	userInfo: {
		fontSize: '13px',
		paddingTop: '10px',
		color: theme.palette.common.contrastText,
	},
	userEmail: {
		color: theme.palette.text.secondary,
		fontSize: '13px',
	},
	accounts: {
		maxHeight: 400,
		overflow: 'auto',
	},
	accountListItemPrimary: {
		lineHeight: 1,
	},
	listItem: {
		// borderTop: `1px solid ${theme.palette.border.main}`,
		paddingTop: '5px',
		paddingBottom: '0px',
	},
	radio: {
		padding: 6,
		left: -6,
	},
	listItemText: {
		multiline: {
			marginTop: 2,
			marginBottom: 2,
		},
	},
	chip: {
		outlinedPrimary: {
			marginLeft: 6,
		},
	},
	logoutItem: {
		borderTop: `1px solid ${theme.palette.border.main}`,
		paddingTop: '15px',
		paddingBottom: '15px',
	},
}))

const UserMenu = ({ activeAccount }: { activeAccount: any }) => {
	const styles = useStyles()
	const dispatch = useAppDispatch()
	const allAccounts = useAppSelector(selectAllAccounts)
	const { email, username } = activeAccount
	const avatarString = username.substring(0, 1).toUpperCase()

	const [anchorEl, setAnchorEl] = useState(null)
	const open = Boolean(anchorEl)
	const handleClick = event => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<Box>
			<IconButton
				aria-controls="user-menu"
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<Avatar className={styles.avatarIconButton}>{avatarString}</Avatar>
			</IconButton>

			<Menu
				id="user-menu"
				keepMounted
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				classes={{ paper: styles.menu }}
			>
				<Box className={styles.avatarIconWrapper}>
					<Box>
						<Avatar className={styles.avatarIcon}>{avatarString}</Avatar>
					</Box>
					<Box className={styles.userInfo}>{username}</Box>
					<Box className={`${styles.userInfo} ${styles.userEmail}`}>{email}</Box>
				</Box>
				<List dense disablePadding className={styles.accounts}>
					{allAccounts.map(({ accountPlatformId, username: usernameAcc, email, accountType }: any) => (
						<MenuItem
							data-id={`${usernameAcc}_MenuItem`}
							onClick={() => dispatch(wsSwitchToAccount(accountPlatformId))}
							key={usernameAcc}
							className={styles.listItem}
						>
							<ListItemIcon>
								<Radio
									size="small"
									checked={username === usernameAcc}
									color="primary"
									className={styles.radio}
								/>
							</ListItemIcon>
							<ListItemText
								primary={usernameAcc}
								secondary={<span style={{ fontSize: '11px' }}>{email}</span>}
								className={styles.listItemText}
							/>
							{accountType === 'main' && (
								<Chip
									color="primary"
									variant="outlined"
									size="small"
									label="main"
									className={styles.chip}
								/>
							)}
						</MenuItem>
					))}
				</List>
				<MenuItem data-id="logoutMenuItem" className={styles.logoutItem} onClick={() => dispatch(wsLogout())}>
					<ListItemIcon>
						<ExitToApp fontSize="small" />
					</ListItemIcon>
					Log Out
				</MenuItem>
			</Menu>
		</Box>
	)
}
export default UserMenu
