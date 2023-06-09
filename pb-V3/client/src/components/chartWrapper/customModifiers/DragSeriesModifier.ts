import { ChartModifierBase2D } from "scichart/Charting/ChartModifiers/ChartModifierBase2D";
import { ModifierMouseArgs } from "scichart/Charting/ChartModifiers/ModifierMouseArgs";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { IRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/IRenderableSeries";
import { Point } from "scichart/Core/Point";
import { TSciChart } from "scichart/types/TSciChart";

export class DragSeriesModifier extends ChartModifierBase2D {

    private lastMousePoint: Point | null;
    private selectedSeries: IRenderableSeries | null;
    private wasmContext: TSciChart;

    public onModifyFinished: (x: number) => void

    constructor(wasmContext: TSciChart, modifierFinishedCallback: (_: number) => void) {
        super()
        this.lastMousePoint = null
        this.selectedSeries = null
        this.wasmContext = wasmContext
        this.onModifyFinished = modifierFinishedCallback
    }

    modifierMouseDown(evt: ModifierMouseArgs) {
        this.lastMousePoint = new Point(evt.mousePoint.x, evt.mousePoint.y)
        this.parentSurface.renderableSeries.asArray().forEach(rs => {
            if (rs.hitTestProvider) {
                // const hitTestInfo = rs.hitTestProvider.hitTest(
                //     new Point(evt.mousePoint.x, evt.mousePoint.y),
                //     ENearestPointLogic.NearestPoint2D,
                //     10,
                //     [ESeriesType.LineSeries].includes(rs.type)
                // );
                // if (hitTestInfo.isHit) {
                //     this.selectedSeries = rs
                //     this.toggleOtherModifiers(false)
                // }
            }
        });
    }

    modifierMouseUp(evt: ModifierMouseArgs) {
        this.selectedSeries = null
        this.toggleOtherModifiers(true)
        this.onModifyFinished(50)
    }


    modifierMouseMove(evt: ModifierMouseArgs) {
        if (!this.lastMousePoint || !this.selectedSeries) return;
        const currentPoint = evt.mousePoint
        const currentY = this.selectedSeries.yAxis.getCurrentCoordinateCalculator().getDataValue(currentPoint.y)
        const startY = this.selectedSeries.yAxis.getCurrentCoordinateCalculator().getDataValue(this.lastMousePoint.y)
        this.lastMousePoint = new Point(currentPoint.x, currentPoint.y)
        this.translateLine(currentY - startY)
    }

    translateLine(deltaY: number) {
        if (!this.lastMousePoint || !this.selectedSeries) return;
        const xValues = this.selectedSeries.dataSeries.getNativeXValues()
        const yValues = this.selectedSeries.dataSeries.getNativeYValues()
        const newXYDataseries = new XyDataSeries(this.wasmContext, {
            xValues: [],
            yValues: [],
        });

        for (let i = 0; i < this.selectedSeries.dataSeries.count(); i++) {
            newXYDataseries.append(xValues.get(i), yValues.get(i) + deltaY)
        }

        this.selectedSeries.dataSeries = newXYDataseries
    }

    toggleOtherModifiers(enabled: boolean) {
        this.parentSurface.chartModifiers.asArray().forEach(modifier => {
            if (!(modifier instanceof DragSeriesModifier)) {
                modifier.isEnabled = enabled
            }
        })
    }
}
