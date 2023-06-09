import React from 'react'
import { makeStyles } from '@material-ui/core'
import Divider, { DividerProps } from '@material-ui/core/Divider'
import { omit } from 'lodash'

import IThemeExtended from 'common/types/themeInterface'

const useDividerStyle = makeStyles((theme: IThemeExtended) => ({
	root: {
		backgroundColor: ({ backgroundColor }: any) => backgroundColor || theme.palette.background.main,
	},
}))

const DividerComponent = <C extends React.ElementType>({ ...props }: DividerProps<C, { component?: C }>) => {
	const classes = useDividerStyle({ backgroundColor: props.backgroundColor })
	const dividerProps = omit(props, 'backgroundColor')
	return <Divider {...dividerProps} classes={classes} />
}

export default DividerComponent
