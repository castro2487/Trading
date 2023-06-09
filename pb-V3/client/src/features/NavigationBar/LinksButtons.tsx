import { Grid, Button, makeStyles } from '@material-ui/core'

import IThemeExtended from 'common/types/themeInterface'

const useStyles = makeStyles((theme: IThemeExtended) => ({
	button: {
		height: 38,
		textTransform: 'unset',
		fontWeight: 400,
		fontSize: '13px',
		color: theme.palette.common.contrastText,
	},
}))

const LinkButton = ({ url, text }) => {
	const styles = useStyles()
	return (
		<Button href={url} target="_blank" className={styles.button}>
			{text}
		</Button>
	)
}

const links = [
	{
		url: 'https://pro.deribit.com/',
		text: 'Trade',
	},
	{
		url: 'https://docs.deribit.com/',
		text: 'Docs',
	},
	{
		url: 'https://pro.deribit.com/kb/futures',
		text: 'Knowledge Base',
	},
]

const LinksButtons = () => (
	<Grid container spacing={1} alignItems="center" justifyContent="flex-end">
		{links.map((link, index) => (
			<Grid item key={`navugationBarButtonLink${index}`}>
				<LinkButton url={link.url} text={link.text} />
			</Grid>
		))}
	</Grid>
)

export default LinksButtons
