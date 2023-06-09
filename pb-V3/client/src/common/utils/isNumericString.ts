const NUMERIC_WITH_DOT_REGEX = new RegExp(/^\d*\.?\d*$/);
const NUMERIC_REGEX = new RegExp(/^\d*$/);

/** This function checks whether the entered parameter is an integer or float written as string */
const isNumericString = (value: string, isFloat?: boolean) => {
	if (isFloat) {
		return NUMERIC_WITH_DOT_REGEX.test(value);
	} else {
		return NUMERIC_REGEX.test(value);
	}
};

export default isNumericString;
