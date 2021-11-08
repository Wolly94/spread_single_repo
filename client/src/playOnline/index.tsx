import { Grid } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { ClientCommunication } from 'spread_game/dist/communication/ClientCommunication'
import { GameClientMessageData } from 'spread_game/dist/messages/inGame/gameClientMessages'
import { GameServerMessage } from 'spread_game/dist/messages/inGame/gameServerMessages'
import authProvider from '../auth/authProvider'
import Game from '../game/game'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import SocketClientImplementation, {
    SocketClient,
} from '../socketClients/socketClient'

// handles socket communication with gameserver
const PlayHuman = () => {
    const history = useHistory()
    const spreadGameClient = useRef<SocketClient<
        GameServerMessage,
        GameClientMessageData
    > | null>(null)
    const [, setRefresh] = React.useState(0)

    const token = useMemo(() => {
        const t = authProvider.getToken()
        return t
    }, [])

    const comm = useMemo(() => {
        if (token === null) {
            history.push(PATHS.root)
        }
        const x = new ClientCommunication<
            GameServerMessage,
            GameClientMessageData
        >(token === null ? '' : token)
        return x
    }, [token, history])

    const connectToServer = useCallback(() => {
        const gameSocketUrl = gameProvider.getSocketUrl()
        if (token === null || gameSocketUrl === null) history.push(PATHS.root)
        else if (
            spreadGameClient.current === null &&
            comm.onReceiveMessage !== null
        ) {
            try {
                spreadGameClient.current = new SocketClientImplementation(
                    gameSocketUrl,
                    token,
                    (msg) => {
                        if (comm.onReceiveMessage !== null)
                            comm.onReceiveMessage(msg)
                    },
                )
                comm.connect((msg) => {
                    if (spreadGameClient.current !== null)
                        spreadGameClient.current.sendMessageToServer(msg.data)
                    else console.log('game client cant send to server')
                })
            } catch {
                gameProvider.clear()
                console.log('invalid gameurl')
            }
            setRefresh((r) => r + 1)
        }
    }, [comm, history, token])

    const disconnectFromGame = useCallback(() => {
        gameProvider.clear()
        if (spreadGameClient.current !== null) {
            spreadGameClient.current.close()
            spreadGameClient.current = null
        }
    }, [])

    useEffect(() => {
        return () => disconnectFromGame()
    }, [disconnectFromGame])

    if (token === null) {
        return <label> no token found </label>
    } else {
        return (
            <Grid container>
                <Grid item>
                    <Game
                        token={token}
                        comm={comm}
                        connectToServer={connectToServer}
                        disconnectFromGame={disconnectFromGame}
                    ></Game>
                </Grid>
            </Grid>
        )
    }
}

export default PlayHuman
