import { Box, Grid } from '@material-ui/core'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { ClientCommunication } from 'spread_game/dist/communication/ClientCommunication'
import ClientMessage from 'spread_game/dist/messages/clientMessage'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import { GameClientMessageData } from 'spread_game/dist/messages/inGame/gameClientMessages'
import {
    ClientLobbyPlayer,
    GameSettings,
    GameServerMessage,
    isServerLobbyMessage,
} from 'spread_game/dist/messages/inGame/gameServerMessages'
import {
    ClientReplayMessage,
    GetReplayMessage,
} from 'spread_game/dist/messages/replay/clientReplayMessages'
import {
    SkillTree,
    skillTreeMethods,
} from 'spread_game/dist/skilltree/skilltree'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import authProvider from '../auth/authProvider'
import MyButton from '../components/MyButton'
import { saveFile } from '../fileService'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import SocketClientImplementation from '../socketClients/socketClient'
import GameCanvas from './GameCanvas'
import GameLobby from './GameLobby'

interface GameProps {
    token: string
    comm: ClientCommunication<GameServerMessage, GameClientMessageData>
    connectToServer: () => void
    disconnectFromGame: () => void
}

const Game: React.FC<GameProps> = (props) => {
    const history = useHistory()
    const [
        clientGameState,
        setClientGameData,
    ] = useState<ClientGameState | null>(null)
    const [map, setMap] = useState<SpreadMap | null>(null)
    const [playerId, setPlayerId] = useState<number | null>(null)
    const [, setRefresh] = React.useState(0)
    const [players, setPlayers] = useState<ClientLobbyPlayer[]>([])
    const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
    const [skillTree, setSkillTree] = useState<SkillTree | null>(null)
    const playerName = useMemo(() => {
        if (playerId !== null) {
            const pl = players.find((p) => p.playerId === playerId)
            if (pl !== undefined && pl.type === 'human') return pl.name
        }
        return null
    }, [playerId, players])

    const onMessageReceive = useCallback((message: GameServerMessage) => {
        //console.log('message received: ', message)
        if (isServerLobbyMessage(message)) {
            if (message.type === 'lobbystate') {
                console.log('lobby state set to ', message.data)
                setPlayers(message.data.players)
                setMap(message.data.map)
                setGameSettings(message.data.gameSettings)
                setSkillTree(skillTreeMethods.fromData(message.data.skillTree))
            } else if (message.type === 'playerid') {
                console.log('set playerid to ', message.data.playerId)
                setPlayerId(message.data.playerId)
            }
        } else {
            if (message.type === 'gamestate') {
                setClientGameData(message.data)
            } else if (message.type === 'gameover') {
                console.log('game is over!')
            } else if (message.type === 'sendreplay') {
                const replay = message.data
                const fileData = JSON.stringify(replay)
                saveFile({ fileName: 'replay.spread.rep', data: fileData })
            }
        }
    }, [])

    const requestReplay = useCallback(() => {
        const mess: GetReplayMessage = {
            type: 'getreplay',
            data: {},
        }
        if (props.comm.sendMessageToServer !== null)
            props.comm.sendMessageToServer(mess)
    }, [props])

    useEffect(() => {
        props.comm.setReceiver(onMessageReceive)
        props.connectToServer()
    }, [onMessageReceive, props])

    const subView = () => {
        if (clientGameState !== null && map !== null) {
            return (
                <Grid container>
                    <Grid item xs={12}>
                        <GameCanvas
                            playerId={playerId}
                            map={map}
                            clientGameState={clientGameState}
                            sendMessageToServer={(msg) => {
                                if (props.comm.sendMessageToServer !== null)
                                    props.comm.sendMessageToServer(msg)
                                else console.log('client cant send to server')
                            }}
                        ></GameCanvas>
                    </Grid>
                    <Grid item>
                        <MyButton onClick={() => requestReplay()}>
                            Download Replay
                        </MyButton>
                    </Grid>
                </Grid>
            )
        } else {
            return (
                <GameLobby
                    map={map}
                    playerId={playerId}
                    playerName={playerName}
                    players={players}
                    setMap={setMap}
                    skillTree={skillTree}
                    sendMessageToServer={(msg) => {
                        if (props.comm.sendMessageToServer !== null)
                            props.comm.sendMessageToServer(msg)
                        else console.log('client cant send to server')
                    }}
                    gameSettings={gameSettings}
                ></GameLobby>
            )
        }
    }
    return (
        <Box>
            <MyButton
                onClick={() => {
                    props.disconnectFromGame()
                    history.push(PATHS.root)
                }}
            >
                Disconnect
            </MyButton>
            {subView()}
        </Box>
    )
}

export default Game
