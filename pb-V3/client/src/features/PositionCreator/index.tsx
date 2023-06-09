import React, { useCallback, useState } from 'react';
import { Box, Tabs, Tab, Button } from '@material-ui/core';
import OptionForm from './OptionForm';
import FutureForm from './FutureForm';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import { selectFutureInstruments, selectOptionsExpirations, selectOptionsInstruments } from 'services/webSocketSlice';

import styles from './pc.module.scss'
import { PositionDirection, PositionType } from 'generated/graphql';
import { createSimulatedPosition } from 'store/positionsSlice';
import { Position } from 'common/types';

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export interface PositionFormValues {
    amount: number;
    instrumentString: string
}

const PositionCreator = () => {

    const dispatch = useAppDispatch();

    // Needed for MUI if we dont use integer there is a problem on initialization
    const [selectedTabValue, setSelectedTabValue] = React.useState(0);

    const optionInstruments = useAppSelector(selectOptionsInstruments)
    const futureInstruments = useAppSelector(selectFutureInstruments)

    const [positionFormValues, setPositionFormValues] = useState<Partial<Position>>({
        positionType: PositionType.Option,
        amount: 0,
        instrument: '',
        direction: PositionDirection.Buy,

    })

    const onChange = (type: PositionType, formValues: PositionFormValues) => {
        setPositionFormValues({
            positionType: type === PositionType.Future ? PositionType.Future : PositionType.Option,
            instrument: formValues.instrumentString,
            amount: formValues.amount
        })
    }

    const createPosition = (direction: PositionDirection) => {
        dispatch(createSimulatedPosition({
            positionType: positionFormValues.positionType,
            instrument: positionFormValues.instrument,
            amount: positionFormValues.amount,
            direction: PositionDirection.Buy
        }))
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>Create simulated position</div>
            <Tabs
                indicatorColor="primary"
                value={selectedTabValue}
                onChange={(e, val) => setSelectedTabValue(val)}
            >
                <Tab
                    disableRipple
                    label={"Option"}
                    {...a11yProps(0)}
                />
                <Tab
                    disableRipple
                    label={"Future"}
                    {...a11yProps(1)}
                />
            </Tabs>
            <div className={styles.formContainer}>
                <div className={styles.form}>
                    {selectedTabValue === 0 ?
                        <OptionForm instruments={optionInstruments} onChange={e => onChange(PositionType.Option, e)} /> :
                        <FutureForm instruments={futureInstruments} onChange={e => onChange(PositionType.Future, e)} />}
                </div>
                <div className={styles.btns}>
                    <Button
                        disabled={false}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => { createPosition(PositionDirection.Buy) }}
                        className={styles.long}
                    >
                        Long
                    </Button>
                    <div className={styles.delimiter}></div>
                    <Button
                        disabled={false}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => { createPosition(PositionDirection.Sell) }}
                        className={styles.short}
                    >
                        Short
                    </Button>
                </div>
                <div className={styles.infoText}>
                    This tool is designed to simulate positions. It is not possible to create trades from the Position Builder.
                </div>
            </div>
        </div>
    )
};

export default PositionCreator;