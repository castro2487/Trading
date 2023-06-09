import { Theme } from '@material-ui/core';

import dark from './dark';
import light from './light';

const themeMap: { [key: string]: Theme } = {
	light,
	dark,
};

export function getThemeByName(theme: string): Theme {
	return themeMap[theme];
}
