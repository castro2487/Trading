import { makeStyles } from '@material-ui/core'

import IThemeExtended from 'common/types/themeInterface'

const dividerStyles = makeStyles((theme: IThemeExtended) => ({
	container: {
		display: 'flex',
		alignItems: 'center',
		width: '100%',
		paddingLeft: '10px',
		paddingRight: '10px',
	},
	border: {
		borderBottom: `1px solid ${theme.palette.secondary.main}`,
		width: '100%',
	},
	content: {
		padding: '18px 10px 18px 10px',
		fontSize: '14px',
		color: theme.palette.text.secondary,
	},
}))

const DividerWithText = ({ children }: { children: any }) => {
	const classesDivider = dividerStyles()
	return (
		<div className={classesDivider.container}>
			<div className={classesDivider.border} />
			<span className={classesDivider.content}>{children}</span>
			<div className={classesDivider.border} />
		</div>
	)
}

export default DividerWithText
