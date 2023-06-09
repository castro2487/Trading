import { createTheme } from '@material-ui/core'
import base from './base'
import merge from 'lodash/merge'

const bodyColor = '#D7E0EB'
const backgroundTable = '#E8EDF3'
const backgroundPaper = '#ffffff'
const textSecondary = '#767f8c'
const primary = '#00CFBE'
const borderMain = '#E8EDF3'

const theme = {
	palette: {
		type: 'light',
		common: {
			black: 'rgba(0, 0, 0, 1)',
			white: '#fff',
			contrastText: '#000',
		},
		background: {
			paper: backgroundPaper,
			default: bodyColor,
			dialog: backgroundTable,
			highlight: backgroundTable,
		},
		text: {
			primary: '#060606',
			secondary: textSecondary,
		},
		primary: {
			main: primary,
		},
		secondary: {
			main: '#767f8c',
		},
		error: {
			main: '#ff0000',
			contrastText: '#fff',
		},
		success: {
			main: '#008800',
			contrastText: '#fff',
		},
		action: {
			disabled: '#aaa',
			hover: '#D7E0EB',
		},
		border: {
			main: borderMain,
		},
	},
	overrides: {
		MuiDivider: {
			root: {
				backgroundColor: borderMain,
			},
		},
		MuiCssBaseline: {
			'@global': {
				// CSS variables for agGrid
				':root': {
					'--text-primary': '#e9e8e7',
					'--text-secondary': textSecondary,
					'--border-radius': '6px',
					'--secondary-color': primary, // checkboxes
					'--row-color': backgroundTable,
					'--header-background-color': backgroundPaper,
				},
			},
		},
		MuiToggleButtonGroup: {
			root: {
				backgroundColor: borderMain,
			},
		},
	},
}

export default createTheme(merge({}, theme, base))
