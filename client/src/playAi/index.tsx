import { Grid } from '@material-ui/core'
import React, { useCallback, useMemo } from 'react'
import { ClientCommunication } from 'spread_game/dist/communication/ClientCommunication'
import { PlayerData } from 'spread_game/dist/communication/gameServerHandler/common'
import { GameServerHandler } from 'spread_game/dist/communication/gameServerHandler/GameServerHandler'
import { GameClientMessageData } from 'spread_game/dist/messages/inGame/gameClientMessages'
import { GameServerMessage } from 'spread_game/dist/messages/inGame/gameServerMessages'
import Game from '../game/game'

const PlayAi = () => {
    const gameHandler = useMemo(() => new GameServerHandler(), [])
    const token = useMemo(() => 'aitoken', [])
    const comm = useMemo(() => {
        const x = new ClientCommunication<
            GameServerMessage,
            GameClientMessageData
        >(token)
        return x
    }, [token])

    const connectToServer = useCallback(() => {
        if (comm.onReceiveMessage !== null) {
            const playerData: PlayerData = {
                name: 'FakeServerPlayerName1000',
            }
            gameHandler.connectClient(token, playerData, comm.onReceiveMessage)
            comm.connect((msg) =>
                gameHandler.onMessageReceive(msg.data, msg.token),
            )
        }
    }, [token, comm, gameHandler])

    return (
        <Grid container>
            <Grid item>
                <Game
                    token={token}
                    comm={comm}
                    connectToServer={connectToServer}
                    disconnectFromGame={() => {}}
                ></Game>
            </Grid>
        </Grid>
    )
}

export default PlayAi
