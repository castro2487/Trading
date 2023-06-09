import React, { useCallback } from 'react'
import { Slider } from '@material-ui/core'
import { useState } from 'react'
import { useEffect } from 'react'
import { throttle } from 'lodash'

type OptionExpirationsSliderProps = {
	expirations: number[]
	onSliderChanged: (x) => void
}

interface Mark {
	value: number
	label: string
}

const RECALCULATION_TIMEOUT = process.env.REACT_APP_SLIDER_RECALCULATION_TIMEOUT_MS || '200'

// TODO validation
const OptionExpirationsSlider: React.FC<OptionExpirationsSliderProps> = ({ expirations, onSliderChanged }) => {

	const endDateInit = expirations.length === 0 ? new Date().valueOf() : expirations[expirations.length - 1]
	const [endDate, setEndDate] = useState<number>(endDateInit)
	const [startDate, setStartDate] = useState<number>(new Date().valueOf())
	const [currentDate, setCurrentDate] = useState<number>(new Date().valueOf())
	const [marks, setmarks] = useState<Mark[]>()
	const [sliderValue, setSliderValue] = useState<number>(0)

	const throttleSaved = useCallback(
		throttle(timestamp => {
			onSliderChanged(timestamp)
		}, parseInt(RECALCULATION_TIMEOUT)),
		[]
	);

	const handleChange = useCallback((e, sliderValue) => {
		const sliderPercent = sliderValue as number
		const milisecondsAfterStart = ((endDate - startDate) * sliderPercent) / 100
		const timestamp = startDate + milisecondsAfterStart
		setSliderValue(sliderPercent)
		throttleSaved(timestamp)
		setCurrentDate(new Date(timestamp).valueOf())
	}, [expirations])

	useEffect(() => {
		const res: Mark[] = []
		const endDate = expirations.length === 0 ? startDate : expirations[expirations.length - 1]
		setEndDate(endDate)

		expirations.forEach(timestamp => {
			const expirationCurrentPercent = (timestamp - startDate) / (endDate - startDate)
			res.push({
				value: expirationCurrentPercent * 100,
				label: '',
			})
		})
		setmarks(res)
	}, [expirations])

	if (expirations.length <= 1) {
		return <div>no expiry dates</div>
	}
	return (
		<div>
			{currentDate && new Date(currentDate).toDateString()}  to	{endDate && new Date(endDate).toDateString()}
			<Slider min={0} max={100} step={1} marks={marks} value={sliderValue} onChange={handleChange} />
		</div>
	)
}

export default OptionExpirationsSlider
