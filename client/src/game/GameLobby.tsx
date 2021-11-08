import { Box, Grid } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ClearSeatMessage,
    ClientLobbyMessage,
    SeatAiMessage,
    SetAiSkilledPerksMessage,
    SetGameSettingsMessage,
    SetMapMessage,
    SetSkilledPerksMessage,
    StartGameMessage,
    TakeSeatMessage,
} from 'spread_game/dist/messages/inGame/clientLobbyMessage'
import {
    ClientLobbyPlayer,
    GameSettings,
} from 'spread_game/dist/messages/inGame/gameServerMessages'
import {
    SkilledPerk,
    SkillTree,
    skillTreeMethods,
} from 'spread_game/dist/skilltree/skilltree'
import { getPlayerIds, SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import { generate2PlayerMap } from 'spread_game/dist/spreadGame/map/mapGenerator'
import MapPreview from '../components/mapPreview'
import MyButton from '../components/MyButton'
import ReadMap from '../components/ReadMap'
import GameSettingsView from './GameSettingsView'
import DisplayPlayerView from './PlayerView'
import SkillTreeView from './SkillTreeView'

interface GameLobbyProps {
    map: SpreadMap | null
    skillTree: SkillTree | null
    setMap: React.Dispatch<React.SetStateAction<SpreadMap | null>>
    playerId: number | null
    playerName: string | null
    players: ClientLobbyPlayer[]
    gameSettings: GameSettings | null
    sendMessageToServer: (message: ClientLobbyMessage) => void
}

const GameLobby: React.FC<GameLobbyProps> = ({
    map,
    setMap,
    gameSettings,
    ...props
}) => {
    const [
        selectedPlayer,
        setSelectedPlayer,
    ] = useState<ClientLobbyPlayer | null>(null)

    useEffect(() => {
        if (selectedPlayer !== null) {
            if (selectedPlayer.type === 'ai') {
                if (
                    !props.players.some(
                        (pl) =>
                            pl.type === 'ai' &&
                            pl.playerId === selectedPlayer.playerId,
                    )
                )
                    setSelectedPlayer(null)
            } else if (
                !props.players.some(
                    (pl) =>
                        pl.type === 'human' && selectedPlayer.name === pl.name,
                )
            ) {
                setSelectedPlayer(null)
            }
        }
    }, [props.players, selectedPlayer])

    const selectMap = (map: SpreadMap) => {
        const m: SetMapMessage = {
            type: 'setmap',
            data: map,
        }
        props.sendMessageToServer(m)
        setMap(map)
    }

    const onRandomMap = () => {
        const randomMap = generate2PlayerMap(1000)
        selectMap(randomMap)
    }

    const startGame = () => {
        const m: StartGameMessage = {
            type: 'startgame',
            data: {},
        }
        props.sendMessageToServer(m)
    }

    const takeSeat = (playerId: number) => {
        const message: TakeSeatMessage = {
            type: 'takeseat',
            data: { playerId: playerId },
        }
        props.sendMessageToServer(message)
    }
    const setAi = (playerId: number) => {
        const message: SeatAiMessage = {
            type: 'seatai',
            data: { playerId: playerId },
        }
        props.sendMessageToServer(message)
    }
    const clear = (playerId: number) => {
        const message: ClearSeatMessage = {
            type: 'clearseat',
            data: { playerId: playerId },
        }
        props.sendMessageToServer(message)
    }
    const setGameSettings = (gameSettings: GameSettings) => {
        const message: SetGameSettingsMessage = {
            type: 'gamesettings',
            data: gameSettings,
        }
        props.sendMessageToServer(message)
    }
    const setSkilledPerks = useCallback(
        (skills: SkilledPerk[]) => {
            if (selectedPlayer === null) return
            else if (
                selectedPlayer.type === 'human' &&
                selectedPlayer.name === props.playerName
            ) {
                const message: SetSkilledPerksMessage = {
                    type: 'setskilledperks',
                    data: skillTreeMethods.toSkilledPerkData(skills),
                }
                props.sendMessageToServer(message)
            } else if (selectedPlayer.type === 'ai') {
                const message: SetAiSkilledPerksMessage = {
                    type: 'setaiskilledperks',
                    data: {
                        skilledPerkData: skillTreeMethods.toSkilledPerkData(
                            skills,
                        ),
                        playerId: selectedPlayer.playerId,
                    },
                }
                props.sendMessageToServer(message)
            }
            setSelectedPlayer(null)
        },
        [selectedPlayer, props],
    )

    return (
        <Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <MyButton onClick={onRandomMap}>
                            {map !== null ? 'Change Map' : 'Select Map'}
                        </MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <ReadMap
                            callback={(map) => {
                                if (map !== null) selectMap(map)
                            }}
                        ></ReadMap>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton disabled={map === null} onClick={startGame}>
                            Start Game
                        </MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        {gameSettings !== null && (
                            <GameSettingsView
                                gameSettings={gameSettings}
                                setGameSettings={setGameSettings}
                            ></GameSettingsView>
                        )}
                    </Grid>
                    {map !== null && (
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <MapPreview
                                        map={map}
                                        width={500}
                                        height={500}
                                    ></MapPreview>
                                </Grid>
                                <Grid item xs={8}>
                                    <Box height={500}>
                                        <DisplayPlayerView
                                            playerIds={
                                                map !== null
                                                    ? Array.from(
                                                          getPlayerIds(map),
                                                      )
                                                    : []
                                            }
                                            playerName={props.playerName}
                                            players={props.players}
                                            takeSeat={takeSeat}
                                            setAi={setAi}
                                            clear={clear}
                                            setSelectedPlayer={(player) =>
                                                setSelectedPlayer(player)
                                            }
                                        ></DisplayPlayerView>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        {props.skillTree !== null &&
                            selectedPlayer !== null && (
                                <SkillTreeView
                                    skillTree={props.skillTree}
                                    skilledPerks={skillTreeMethods.toSkilledPerks(
                                        selectedPlayer.skilledPerks,
                                    )}
                                    readonly={
                                        !(
                                            selectedPlayer.type === 'ai' ||
                                            props.playerName ===
                                                selectedPlayer.name
                                        )
                                    }
                                    playerName={
                                        selectedPlayer.type === 'human'
                                            ? selectedPlayer.name
                                            : 'AI at ' +
                                              (
                                                  selectedPlayer.playerId + 1
                                              ).toString()
                                    }
                                    save={(skilledPerks) =>
                                        setSkilledPerks(skilledPerks)
                                    }
                                ></SkillTreeView>
                            )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

export default GameLobby
