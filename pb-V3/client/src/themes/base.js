// import createBreakpoints from '@material-ui/core/styles/createBreakpoints';
import { sourceRobotoRegular, sourceRobotoBold, sourceRobotoMedium, sourceRobotoLight } from 'assets/fonts/Roboto'
// const breakpoints = createBreakpoints({});

const theme = {
	spacing: 4, // default is 8
	overrides: {
		MuiCssBaseline: {
			'@global': {
				'@font-face': [sourceRobotoRegular, sourceRobotoBold, sourceRobotoMedium, sourceRobotoLight],

				// scrollbars
				html: {
					scrollbarColor: 'rgba(0, 0, 0, 0.30) transparent',
					scrollbarWidth: 'thin',
				},
				'*::-webkit-scrollbar': {
					width: '12px',
					height: '12px',
				},
				'*::-webkit-scrollbar-thumb': {
					height: '6px',
					border: '4px solid rgba(0, 0, 0, 0)',
					borderRadius: '25px',
					backgroundClip: 'padding-box',
					'&::-webkit-border-radius': '7px',
					backgroundColor: 'rgba(0, 0, 0, 0.30)',
					'&::-webkit-box-shadow': 'inset -1px -1px 0px rgba(0, 0, 0, 0.05)',
				},
				'*::-webkit-scrollbar-button': {
					width: '0px',
					height: '0px',
					display: 'none',
				},
				'*::-webkit-scrollbar-corner': {
					backgroundColor: 'transparent',
				},
				// END scrollbars
			},
		},
		MuiTypography: {
			caption: {
				fontSize: '12px',
			},
		},
		MuiListItemIcon: {
			root: {
				minWidth: '40px',
			},
		},
	},
}

export default theme
