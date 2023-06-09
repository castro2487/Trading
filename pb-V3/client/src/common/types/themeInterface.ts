import { Theme } from '@material-ui/core/styles/createTheme';
import { Palette } from '@material-ui/core/styles/createPalette';

interface IPalette extends Palette {
	common: {
		contrastText: string;
		black: string;
		white: string;
	};
	background: {
		default: string;
		main: string;
		paper: string;
		dialog: string;
		highlight: string;
	};
	border: {
		main: string;
	}
}
interface IThemeExtended extends Theme {
	palette: IPalette;
}

export default IThemeExtended;
