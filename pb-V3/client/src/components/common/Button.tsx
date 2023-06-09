import MaterialUiButton, { ButtonProps } from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core'

import IThemeExtended from 'common/types/themeInterface'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	root: {
		height: ({ height }: ExtraProps) => height || '38px',
		borderRadius: '6px',
		color: '#fff',
		textTransform: 'unset',
		boxShadow: 'none',
		fontWeight: 400,
		fontSize: '13px',
		whiteSpace: 'nowrap',
	},
	outlinedPrimary: {
		color: theme.palette.primary.main,
	},
}))

interface ExtraProps {
	height?: string
}

const Button = <C extends React.ElementType>({ height, ...props }: ButtonProps<C, { component?: C }> & ExtraProps) => {
	const styles = useStyles({ height })
	return <MaterialUiButton {...props} classes={styles} />
}

export default Button
