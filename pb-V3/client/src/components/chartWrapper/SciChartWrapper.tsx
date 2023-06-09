import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { SciChartSurface } from "scichart/Charting/Visuals/SciChartSurface";
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { FastLineRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastLineRenderableSeries";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { ZoomPanModifier } from "scichart/Charting/ChartModifiers/ZoomPanModifier";
import { TSciChart } from "scichart/types/TSciChart";

import { MouseWheelZoomModifier } from 'scichart/Charting/ChartModifiers/MouseWheelZoomModifier';

import { XAxisDragModifier } from 'scichart/Charting/ChartModifiers/XAxisDragModifier';
import { YAxisDragModifier } from 'scichart/Charting/ChartModifiers/YAxisDragModifier';
import { ZoomExtentsModifier } from 'scichart/Charting/ChartModifiers/ZoomExtentsModifier';
import { EDragMode } from 'scichart/types/DragMode';
import { NumberRange } from "scichart/Core/NumberRange";
import { DragSeriesModifier } from "./customModifiers/DragSeriesModifier";
import { EAxisAlignment } from "scichart/types/AxisAlignment";

/**
 * SciChart implementation for the positions graph. This component exposes methods (ReferenceMethods) that could
 * be called from its parent component. Calling some of these methods will result in some action on the graph. 
 * The other way in which this chart will update is by changing the props for some of the lines that we are
 * presenting. 
 */
interface SciChartProps {
    todayLine: number[] | null;
    expiryLine: number[] | null;
    volotilatySmile: number[] | null;
    xAxisValues: number[];
    onModify: (args: any) => void
}

interface SciChartElements {
    sciChartSurface: SciChartSurface;
    wasmContext: TSciChart;
    todayLineSeries: FastLineRenderableSeries;
    expireLineSeries: FastLineRenderableSeries;
    volotilatySmileyLineSeries: FastLineRenderableSeries;
    xAxis: NumericAxis;
    yAxis: NumericAxis;
}

export interface ReferenceMethods {
    centerGraph: (xrange: number[], yrange: number[]) => any
    redraw: () => void
}

async function initSciChart(onModify: (args: any) => void) {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(
        "scichart-root"
    );

    //custom modifiers
    const dragSeriesModifier = new DragSeriesModifier(wasmContext, onModify)

    sciChartSurface.chartModifiers.add(
        dragSeriesModifier,
        new MouseWheelZoomModifier(),
        new XAxisDragModifier({ dragMode: EDragMode.Scaling }),
        new YAxisDragModifier({ dragMode: EDragMode.Scaling }),
        new ZoomExtentsModifier(),
        new ZoomPanModifier()
    );

    const xAxis = new NumericAxis(wasmContext);
    const yAxis = new NumericAxis(wasmContext, {
        axisAlignment: EAxisAlignment.Left
    });

    const IV_Y_AXIS_ID = 'ivYAxis'
    const volYAxis = new NumericAxis(wasmContext, {
        axisAlignment: EAxisAlignment.Right,
        id: IV_Y_AXIS_ID
    })

    const formatPriceNumberSmall = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });

    // yAxis.labelProvider.formatLabel = (dataValue: number) => formatPriceNumberSmall.format(dataValue);

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);
    sciChartSurface.yAxes.add(volYAxis);


    // TODO extract and make it configurable (color etc)
    const expireLineSeries = new FastLineRenderableSeries(wasmContext, {
        stroke: "red",
    });

    expireLineSeries.strokeThickness = 3;
    sciChartSurface.renderableSeries.add(expireLineSeries);

    expireLineSeries.dataSeries = new XyDataSeries(wasmContext, {
        xValues: [],
        yValues: [],
    });

    const todayLineSeries = new FastLineRenderableSeries(wasmContext, {
        stroke: "green",
    });

    todayLineSeries.strokeThickness = 3;
    sciChartSurface.renderableSeries.add(todayLineSeries);

    todayLineSeries.dataSeries = new XyDataSeries(wasmContext, {
        xValues: [],
        yValues: [],
    });

    const volotilatySmileLineSeries = new FastLineRenderableSeries(wasmContext, {
        stroke: "orange",
        yAxisId: IV_Y_AXIS_ID
    });

    volotilatySmileLineSeries.strokeThickness = 3;
    sciChartSurface.renderableSeries.add(volotilatySmileLineSeries);

    volotilatySmileLineSeries.dataSeries = new XyDataSeries(wasmContext, {
        xValues: [],
        yValues: [],
    });

    return { sciChartSurface, wasmContext, todayLineSeries, expireLineSeries, volotilatySmileyLineSeries: volotilatySmileLineSeries, xAxis, yAxis }
}

export const SciChart = forwardRef<ReferenceMethods, SciChartProps>(
    ({ todayLine, expiryLine, volotilatySmile, xAxisValues, onModify }, ref) => {

        const [chartElements, setChartElements] = useState<SciChartElements>()

        const redrawGraphLines = (wasmContext: TSciChart,
            expireLineSeries: FastLineRenderableSeries,
            todayLineSeries: FastLineRenderableSeries,
            volotilatyLineSeries: FastLineRenderableSeries) => {
            if (todayLine && todayLine.length > 0) {
                todayLineSeries.dataSeries = new XyDataSeries(wasmContext, {
                    xValues: xAxisValues,
                    yValues: todayLine,
                })
            }
            if (expiryLine && expiryLine.length > 0) {
                expireLineSeries.dataSeries = new XyDataSeries(wasmContext, {
                    xValues: xAxisValues,
                    yValues: expiryLine
                })
            }
            if (volotilatySmile && volotilatySmile.length > 0) {
                volotilatyLineSeries.dataSeries = new XyDataSeries(wasmContext, {
                    xValues: xAxisValues,
                    yValues: volotilatySmile
                })
            }
        }

        useImperativeHandle(ref, () => ({
            centerGraph(xrange, yrange) {
                if (!chartElements) return;
                chartElements.xAxis.visibleRange = new NumberRange(xrange[0], xrange[1])
                chartElements.yAxis.visibleRange = new NumberRange(yrange[0], yrange[1])
            },
            redraw() {
                if (!chartElements) return;
                chartElements.sciChartSurface.invalidateElement()
            },
        }));

        useEffect(() => {
            (async () => {
                const res = await initSciChart(onModify);
                setChartElements(res);

                // Needs for the initial render since the creating the scichart surface is async.
                // No need in reality.
                redrawGraphLines(res.wasmContext, res.expireLineSeries, res.todayLineSeries, res.volotilatySmileyLineSeries)
            })();

            return () => {
                if (!chartElements) return;
                chartElements.sciChartSurface.delete();
            };
        }, []);

        useEffect(() => {
            if (!chartElements) return;
            redrawGraphLines(chartElements.wasmContext, chartElements.expireLineSeries, chartElements.todayLineSeries, chartElements.volotilatySmileyLineSeries)
        }, [todayLine, expiryLine, volotilatySmile]);


        return (
            <div>
                <div id="scichart-root" style={{ width: 600, margin: "auto" }} />
            </div>
        );
    }
);
