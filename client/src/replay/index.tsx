import { Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import MyButton from '../components/MyButton'
import ReadReplay from '../components/ReadReplay'
import { PATHS } from '../Routes'
import Replay from './replay'

const ReplayView = () => {
    const history = useHistory()
    const [replay, setReplay] = useState<SpreadReplay | null>(null)
    return (
        <Grid container spacing={2}>
            <Grid item>
                <ReadReplay
                    callback={(data) => {
                        if (data !== null) {
                            setReplay(data)
                        }
                    }}
                ></ReadReplay>
            </Grid>
            <Grid item>
                <MyButton onClick={() => history.push(PATHS.root)}>
                    Back
                </MyButton>
            </Grid>
            {replay !== null && (
                <Grid item xs={12}>
                    <Replay
                        replay={replay}
                        react={'Restart'}
                        perspectivePlayerId={null}
                    ></Replay>
                </Grid>
            )}
        </Grid>
    )
}

export default ReplayView
