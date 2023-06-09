import { createTheme } from '@material-ui/core'
import base from './base'
import merge from 'lodash/merge'

const bodyColor = '#204555'
const backgroundTable = '#102831'
const backgroundPaper = '#0C1B21'
const textSecondary = '#77949F'
const primary = '#00CFBE'
const borderMain = '#1A3B49'
const backgroundHighlight = '#1A3B49'

const theme = {
	palette: {
		type: 'dark',
		common: {
			black: '#000',
			white: '#fff',
			contrastText: '#fff',
		},
		background: {
			paper: backgroundPaper,
			default: bodyColor,
			dialog: backgroundTable,
			highlight: backgroundHighlight,
		},
		text: {
			primary: '#e9e8e7',
			secondary: textSecondary,
		},
		primary: {
			main: primary,
		},
		secondary: {
			main: '#77949F',
		},
		error: {
			main: '#EB5757',
			contrastText: '#fff',
		},
		success: {
			main: '#32C57A',
			contrastText: '#fff',
		},
		action: {
			disabled: '#aaa',
			hover: '#162F3A',
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
				html: {
					scrollbarColor: `${backgroundHighlight} transparent`,
				},
				'*::-webkit-scrollbar-thumb': {
					backgroundColor: backgroundHighlight,
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
