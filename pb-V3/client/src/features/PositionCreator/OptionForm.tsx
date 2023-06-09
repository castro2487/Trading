import { Instrument } from "common/types"
import { useEffect, useState } from "react";

import { TextField, Autocomplete } from '@mui/material';

import styles from './pc.module.scss'
import { PositionFormValues } from ".";

interface OptionFormProps {
    instruments: Instrument[],
    onChange: (x: PositionFormValues) => void
}
interface SelectItem {
    label: string
}

const OptionForm: React.FC<OptionFormProps> = ({ instruments, onChange }) => {

    const [instrumentsSelectItems, setInstrumentsSelectItems] = useState<SelectItem[]>([])

    const [amount, setAmount] = useState(0)
    const [instrumentString, setInstrumentString] = useState('')

    const handleAutocomplete = (_, item) => {
        if (item) {
            setInstrumentString(item.label)
            onChange({ amount, instrumentString: item.label })
        } else {
            setInstrumentString('')
        }
    }

    const handleAmount = (value) => {
        setAmount(value)
        onChange({ amount: value, instrumentString })
    }

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
            onChange={handleAutocomplete}
            renderInput={(params) => <TextField {...params} placeholder="Instrument" />}
        />
        <TextField
            className={styles.inputRow}
            fullWidth
            id="time"
            placeholder="Amount"
            type="number"
            variant="outlined"
            onChange={e => handleAmount(parseFloat(e.target.value))} />
    </div>
}

export default OptionForm