import { Box, MenuItem, Select, TextField, Typography } from '@material-ui/core'
import { useFormik } from 'formik'
import React from 'react'
import { radiusToUnits } from 'spread_game/dist/spreadGame/common'
import {
    MapCell,
    SpreadMap,
    availableSpace,
    updateCellInMap,
    mapDefaults,
} from 'spread_game/dist/spreadGame/map/map'
import * as yup from 'yup'
import MyButton from '../components/MyButton'

const neutralPlayerId = -1

interface MapCellFormValues {
    xCoord: number
    yCoord: number
    radius: number
    units: number
    playerId: number
}

interface EditorFormProps {
    selectedCell: MapCell
    map: SpreadMap
    setMap: React.Dispatch<React.SetStateAction<SpreadMap>>
    removeCell: (cellId: number) => void
}

const EditorForm: React.FC<EditorFormProps> = (props) => {
    const initialValues: MapCellFormValues = {
        xCoord: props.selectedCell.position[0],
        yCoord: props.selectedCell.position[1],
        radius: props.selectedCell.radius,
        units: props.selectedCell.units,
        playerId:
            props.selectedCell.playerId === null
                ? neutralPlayerId
                : props.selectedCell.playerId,
    }

    const validation = yup.object().shape({
        xCoord: yup.number().required().typeError('You have to enter a number'),
        yCoord: yup.number().required().typeError('You have to enter a number'),
        radius: yup.number().required().typeError('You have to enter a number'),
        units: yup.number().required().typeError('You have to enter a number'),
        playerId: yup.number().typeError('You have to enter a number'),
    })
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validation,
        enableReinitialize: true,

        onSubmit: (values, { setSubmitting, setStatus, resetForm }) => {
            if (values.radius <= 0) {
                props.removeCell(props.selectedCell.id)
                return
            }
            const maxRadius = availableSpace(props.map, props.selectedCell)
            const radius = Math.min(maxRadius, values.radius)
            const units = Math.min(2 * radiusToUnits(radius), values.units)
            const newSelectedCell: MapCell = {
                ...props.selectedCell,
                position: [values.xCoord, values.yCoord],
                units: units,
                radius: radius,
                playerId:
                    values.playerId === neutralPlayerId
                        ? null
                        : values.playerId,
            }
            const r = updateCellInMap(newSelectedCell, props.map)
            props.setMap(r.map)
            if (r.error === null) {
                resetForm()
            } else {
                setStatus(r.error)
            }
        },
    })

    let players = []
    for (let i = 0; i < mapDefaults.maxPlayers /*props.map.players*/; i++) {
        players.push(i)
    }

    return (
        <form onSubmit={formik.handleSubmit}>
            {formik.status !== undefined && (
                <Typography variant="h5" component="h5" color="error">
                    {formik.status}
                </Typography>
            )}
            <Box paddingBottom={3}></Box>
            <TextField
                id="xCoord"
                label={'x-Coordinate'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.xCoord}
                onChange={(e) => {
                    formik.handleChange(e)
                    //formik.submitForm()
                }}
                error={formik.touched.xCoord && Boolean(formik.errors.xCoord)}
                helperText={formik.touched.xCoord && formik.errors.xCoord}
            />
            <Box paddingBottom={3}></Box>

            <TextField
                id="yCoord"
                label={'y-Coordinate'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.yCoord}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                error={formik.touched.yCoord && Boolean(formik.errors.yCoord)}
                helperText={formik.touched.yCoord && formik.errors.yCoord}
            />
            <Box paddingBottom={3}></Box>

            <TextField
                id="radius"
                label={'Radius'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.radius}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                error={formik.touched.radius && Boolean(formik.errors.radius)}
                helperText={formik.touched.radius && formik.errors.radius}
            />
            <Box paddingBottom={3}></Box>

            <TextField
                id="units"
                label={'Units'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.units}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                error={formik.touched.units && Boolean(formik.errors.units)}
                helperText={formik.touched.units && formik.errors.units}
            />
            <Box paddingBottom={3}></Box>

            <Select
                name="playerId"
                value={formik.values.playerId}
                onChange={(e) => {
                    formik.handleChange(e)
                    //formik.submitForm()
                    formik.handleSubmit()
                }}
                onBlur={formik.handleBlur}
                style={{ display: 'block' }}
            >
                <MenuItem value={-1}>Neutral Player</MenuItem>

                {players.map((i) => (
                    <MenuItem key={i} value={i}>
                        Player {i + 1}
                    </MenuItem>
                ))}
            </Select>
            <Box paddingBottom={3}></Box>

            <MyButton type="submit" onClick={(ev) => formik.handleSubmit()}>
                Apply Changes
            </MyButton>
        </form>
    )
}

export default EditorForm
