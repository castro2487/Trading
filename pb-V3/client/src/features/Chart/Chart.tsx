import { Currency, ImpliedVolatilityType } from 'common/types';
import { useEffect, useRef, useState } from 'react';

import { useAppSelector, useAppDispatch } from 'common/hooks';
import { ReferenceMethods, SciChart } from 'components/chartWrapper/SciChartWrapper';
import {
    selectGraphData,
    currencyUpdated,
    refreshGraphData,
    calculateSinglePoint
} from './chartSlice';

import { selectExpirations } from 'store/positionsSlice';
import OptionExpirationsSlider from './OptionExpirationSlider';
import { selectDomain, selectGraphCalculationCurrency, selectImpliedVolatilityType, setImpliedVolatilityType } from 'store/settingsSlice';

/**
 * Container component for our charting implementation. This component should have the selectors
 * for the data that we should display in the chart. Also the controls that change the graph.
 */
const ChartContainer = () => {
    const dispatch = useAppDispatch();
    const graphData = useAppSelector(selectGraphData);
    const expirations = useAppSelector(selectExpirations);
    const graphDomain = useAppSelector(selectDomain)
    const graphCalCurrency = useAppSelector(selectGraphCalculationCurrency)
    const implVolType = useAppSelector(selectImpliedVolatilityType)

    const [xrange, setXrange] = useState([20000, 90000])
    const [yrange, setYrange] = useState([-0.05, 0.05])
    const [pricePoint, setPricePoint] = useState('1')

    // we can use this ref to call methods that are connected with the scichart third part library.
    const chartImplementation = useRef<ReferenceMethods>(null);

    const center = () => {
        chartImplementation.current?.centerGraph(xrange, yrange)
    }

    useEffect(() => {
        chartImplementation.current?.centerGraph([graphDomain.x.start, graphDomain.x.end], [graphDomain.y.start, graphDomain.y.end])
    }, [graphDomain])

    const onModify = (x: number) => {
        // debugger
    }

    const updateRange = (axis, range: string) => {
        const values = range.split('/')
        const rangeVals = [parseFloat(values[0]), parseFloat(values[1])]
        if (axis === 'x') {
            setXrange(rangeVals)
        } else {
            setYrange(rangeVals)
        }
    }

    const onSliderChanged = (timestamp) => {
        dispatch(refreshGraphData(timestamp))
    }

    const clearStorage = () => {
        localStorage.clear()
        sessionStorage.clear()
    }

    const calculatePoint = () => {
        dispatch(calculateSinglePoint(parseFloat(pricePoint)))
    }

    const toggleImplied = () => {
        dispatch(setImpliedVolatilityType(implVolType === ImpliedVolatilityType.STICKY_DELTA ? ImpliedVolatilityType.STICKY_STRIKE : ImpliedVolatilityType.STICKY_DELTA))
        dispatch(refreshGraphData())
    }

    return (
        <div>
            <OptionExpirationsSlider expirations={expirations} onSliderChanged={onSliderChanged} />
            <SciChart ref={chartImplementation}
                todayLine={graphData.chartLines.todayLine.values}
                expiryLine={graphData.chartLines.expireLine.values}
                xAxisValues={graphData.xAxisValues}
                volotilatySmile={graphData.volotilitySmile}
                onModify={onModify}
            />
            <button onClick={e => center()}>center</button>
            <input placeholder="xrange" onChange={e => updateRange('x', e.target.value)} />
            <input placeholder="yrange" onChange={e => updateRange('y', e.target.value)} />
            <button onClick={e => dispatch(refreshGraphData())}> Recalculate positions</button>
            Current calculation cur : {graphCalCurrency}
            <button onClick={e => dispatch(currencyUpdated(Currency.BTC))}>use BTC</button>
            <button onClick={e => dispatch(currencyUpdated(Currency.USD))}>use USD</button>
            <button onClick={clearStorage}>Clear storage</button>
            <br />
            <input type="text" placeholder="price point" onChange={e => setPricePoint(e.target.value)} />
            <button onClick={calculatePoint}>Calculate point</button>
            Current implied vol type: {implVolType}
            <button onClick={toggleImplied}>Toggle Implied Volatility</button>
            <br />
            {/* {graphData.currency} */}
        </div>
    );
}

export default ChartContainer
