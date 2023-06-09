import { TextField, Autocomplete } from '@mui/material';
import { Instrument } from 'common/types';
import { useEffect, useState } from 'react';
import { PositionFormValues } from '.';

import styles from './pc.module.scss'

interface OptionFormProps {
    instruments: Instrument[]
    onChange: (x: PositionFormValues) => void
}
interface SelectItem {
    label: string
}

const FutureForm: React.FC<OptionFormProps> = ({ instruments }) => {

    const [instrumentsSelectItems, setInstrumentsSelectItems] = useState<SelectItem[]>([])

    useEffect(() => {
        setInstrumentsSelectItems(instruments.map(i => {
            return {
                label: i.instrumentString
            }
        }))
    }, [instruments])

    return <div>
        <Autocomplete
            className={styles.inputRow}
            fullWidth
            options={instrumentsSelectItems}
            renderInput={(params) => <TextField {...params} placeholder="Instrument" />}
        />
        <TextField
            className={styles.inputRow}
            fullWidth
            id="time"
            placeholder="Amount"
            type="number"
            variant="outlined" />
    </div>
}

export default FutureForm