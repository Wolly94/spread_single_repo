import { Box, Grid, makeStyles } from '@material-ui/core'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import {
    emptyMap,
    SpreadMap,
    validateMap,
} from 'spread_game/dist/spreadGame/map/map'
import { generate2PlayerMap } from 'spread_game/dist/spreadGame/map/mapGenerator'
import MyButton from '../components/MyButton'
import ReadMap from '../components/ReadMap'
import { ReadFile, saveFile } from '../fileService'
import { PATHS } from '../Routes'
import EditorCanvas from './editorCanvas'

const useStyles = makeStyles({
    centered: {
        width: '65%',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '100px',
        paddingLeft: '12.5%',
    },
})

const Editor = () => {
    const classes = useStyles()
    const history = useHistory()
    const [unselectCell, setUnselectCell] = useState(0)

    const [map, setMap] = useState(emptyMap())

    const handleRead = (map: SpreadMap) => {
        setMap(map)
        setUnselectCell(unselectCell + 1)
    }

    const handleSave = () => {
        const r = validateMap(map)
        console.log(JSON.stringify(r.message))
        const data = JSON.stringify(r.map)
        setMap(r.map)
        saveFile({ fileName: 'Map.spread', data: data })
    }

    const startOver = () => {
        const m = emptyMap()
        setMap(m)
        setUnselectCell(unselectCell + 1)
    }

    const randomMap = () => {
        const m = generate2PlayerMap(1000)
        setMap(m)
        setUnselectCell(unselectCell + 1)
    }

    return (
        <Box className={classes.centered}>
            <Grid container spacing={4} direction={'row'}>
                <Grid container spacing={4} direction={'row'}>
                    <Grid item xs={3}>
                        <MyButton onClick={startOver}>New Map</MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton onClick={randomMap}>Random Map</MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <ReadMap
                            callback={(map) => {
                                if (map !== null) handleRead(map)
                            }}
                        ></ReadMap>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton onClick={handleSave}>Save Map</MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton onClick={() => history.push(PATHS.root)}>
                            Back
                        </MyButton>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <EditorCanvas
                        map={map}
                        setMap={setMap}
                        unselectCell={unselectCell}
                    ></EditorCanvas>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Editor
