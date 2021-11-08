import { Grid, Slider } from '@material-ui/core'

interface ControlBarData {
    timePassedInMs: number
    maxLengthInMs: number
    setTime: (timePassedInMs: number) => void
}

export const ControlBar: React.FC<ControlBarData> = (props) => {
    const handleChange = (newValue: number) => {
        props.setTime(newValue * 1000)
    }

    const stepValue = 0.1

    return (
        <Grid container>
            <Grid item xs={12}>
                <Slider
                    value={props.timePassedInMs / 1000}
                    valueLabelDisplay="auto"
                    min={0}
                    max={props.maxLengthInMs / 1000}
                    step={stepValue}
                    onChange={(_event, val) => {
                        if (Array.isArray(val)) handleChange(val[0])
                        else handleChange(val)
                    }}
                    aria-labelledby="continuous-slider"
                ></Slider>
            </Grid>
        </Grid>
    )
}
