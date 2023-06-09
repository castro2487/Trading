import { useState, useCallback } from 'react'
import { makeStyles, Modal, Grid, CircularProgress, Box, Link, useTheme, TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import { Button, DividerWithText } from 'components/common'
import isNumericString from 'common/utils/isNumericString'
import IThemeExtended from 'common/types/themeInterface'
import { useAppDispatch } from 'common/hooks'
import { wsLogin } from 'services/webSocketSlice'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	wrapper: {
		width: '450px',
		padding: '40px',
		paddingTop: '31px',
		backgroundColor: theme.palette.background.dialog,
		borderRadius: '6px',
	},
	headerWrapper: {
		display: 'flex',
		justifyContent: 'space-between',
	},
	title: {
		fontSize: '26px',
		fontWeight: 500,
		color: theme.palette.common.contrastText,
		paddingBottom: '29px',
	},
	closeButton: {
		color: theme.palette.common.contrastText,
		cursor: 'pointer',
	},
	linksWrapper: {
		fontSize: '12px',
		color: theme.palette.common.contrastText,
		display: 'flex',
		justifyContent: 'center',
	},
}))

const LoginForm = ({ open, handleClose }) => {
	const theme: IThemeExtended = useTheme()
	const styles = useStyles()
	const inputStyle = { WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.dialog} inset` }

	const dispatch = useAppDispatch()
	const [state, setState] = useState({
		grant_type: 'password',
		email: localStorage.getItem('loginformemail') || '',
		password: '',
		accessKey: '',
		accessSecret: '',
		tfa: '',
		isLoginPending: false,
	})

	const changeAuthenticationType = useCallback(value => {
		setState(state => ({
			...state,
			grant_type: value,
		}))
	}, [])

	const changeHandler = useCallback(event => {
		const { value, name } = event.target

		setState(state => ({
			...state,
			[name]: value,
		}))
	}, [])

	const tfaChangeHandler = useCallback(event => {
		const { value } = event.target

		if (isNumericString(value) || value === '') {
			setState(prevState => ({
				...prevState,
				tfa: value,
			}))
		}
	}, [])

	const submitFormHandler = async event => {
		event.preventDefault()

		setState(state => ({ ...state, isLoginPending: true }))

		if (state.grant_type === 'password') {
			dispatch(wsLogin({ email: state.email, password: state.password }))
			handleClose()
		}
		// else {
		// 	 loginByApiKey()
		// }
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
			className={styles.container}
		>
			<>
				<form onSubmit={submitFormHandler}>
					<Grid container spacing={4} className={styles.wrapper}>
						<Grid item xs={12} className={styles.headerWrapper}>
							<span className={styles.title}>Log In</span>
							<span className={styles.closeButton} onClick={handleClose}>
								<CloseIcon />
							</span>
						</Grid>

						<Grid item xs={12}>
							{state.grant_type === 'password' ? (
								<Button
									variant="outlined"
									data-id="passwordBtn"
									fullWidth
									color="primary"
									onClick={() => changeAuthenticationType('credentials')}
								>
									Login with API Credentials?
								</Button>
							) : (
								<Button
									variant="outlined"
									data-id="credentialsBtn"
									fullWidth
									color="primary"
									onClick={() => changeAuthenticationType('password')}
								>
									Login with Password?
								</Button>
							)}
						</Grid>

						<DividerWithText>or</DividerWithText>

						{state.grant_type === 'password' ? (
							<>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										id="email"
										name="email"
										label="Email Address"
										value={state.email}
										onChange={changeHandler}
										fullWidth
										inputProps={{ style: inputStyle }}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										id="password"
										name="password"
										label="Password"
										value={state.password}
										onChange={changeHandler}
										fullWidth
										type="password"
										inputProps={{ style: inputStyle }}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										id="tfa"
										name="tfa"
										label="2FA Code (if enabled)"
										value={state.tfa}
										onChange={tfaChangeHandler}
										fullWidth
										inputProps={{
											autoComplete: 'off',
											maxLength: '6',
											style: inputStyle,
										}}
									/>
								</Grid>
							</>
						) : (
							<>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										id="accessKey"
										name="accessKey"
										label="Key"
										value={state.accessKey}
										onChange={changeHandler}
										fullWidth
										inputProps={{ style: inputStyle }}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										id="accessSecret"
										name="accessSecret"
										label="Secret"
										value={state.accessSecret}
										onChange={changeHandler}
										fullWidth
										inputProps={{ style: inputStyle }}
									/>
								</Grid>
							</>
						)}

						<Grid item xs={12} style={{ margin: '24px 0px' }}>
							<Button
								variant="contained"
								data-id="loginBtn"
								fullWidth
								color="primary"
								type={state.isLoginPending ? 'button' : 'submit'}
								disabled={state.isLoginPending}
							>
								{state.isLoginPending && (
									<Box mr="6px">
										<CircularProgress size="20px" color="inherit" />
									</Box>
								)}
								Log In
							</Button>
						</Grid>

						<Grid container spacing={2}>
							<Grid item xs={12} className={styles.linksWrapper}>
								Don't have an account? &nbsp;
								<Link component="button">Register</Link>
							</Grid>
							<Grid item xs={12} className={styles.linksWrapper}>
								<Link component="button">Forgot your password?</Link>
								&nbsp;&nbsp;
								<Link component="button">Recovery Code</Link>
							</Grid>
						</Grid>
					</Grid>
				</form>
			</>
		</Modal>
	)
}

export default LoginForm
