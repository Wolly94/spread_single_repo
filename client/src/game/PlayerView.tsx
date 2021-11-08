import { Box, Grid, Typography } from '@material-ui/core'
import React from 'react'
import {
    ClientHumanPlayer,
    ClientAiPlayer,
    ClientLobbyPlayer,
} from 'spread_game/dist/messages/inGame/gameServerMessages'
import { playerColors } from '../drawing/draw'

interface LobbyCellProps {
    label: string
    backgroundColor?: string | undefined
}

const LobbyCell: React.FC<LobbyCellProps> = (props) => {
    return (
        <Box bgcolor={props.backgroundColor}>
            <Typography variant="h4" component="h5">
                {props.label}
            </Typography>
        </Box>
    )
}

interface EmptyRowProps {
    playerId: number
    takeSeat: (playerId: number) => void
    setAi: (playerId: number) => void
}

const EmptyRow: React.FC<EmptyRowProps> = (props) => {
    return (
        <Grid container>
            <Grid item xs={4}>
                <LobbyCell
                    label={'Player ' + (props.playerId + 1).toString()}
                    backgroundColor={playerColors[props.playerId]}
                ></LobbyCell>
            </Grid>
            <Grid item xs={4}>
                <button onClick={() => props.takeSeat(props.playerId)}>
                    <LobbyCell label={'Take'}></LobbyCell>
                </button>
            </Grid>
            <Grid item xs={4}>
                <button onClick={() => props.setAi(props.playerId)}>
                    <LobbyCell label={'AI'}></LobbyCell>
                </button>
            </Grid>
        </Grid>
    )
}

interface HumanRowProps {
    player: ClientHumanPlayer
    owner: boolean
    setSelectedPlayer: (player: ClientHumanPlayer) => void
}

const HumanRow: React.FC<HumanRowProps> = (props) => {
    return (
        <Grid container>
            <Grid item xs={2}>
                <LobbyCell
                    label={'Player ' + (props.player.playerId + 1).toString()}
                    backgroundColor={playerColors[props.player.playerId]}
                ></LobbyCell>
            </Grid>
            <Grid item xs={6}>
                <LobbyCell label={props.player.name}></LobbyCell>
            </Grid>
            <Grid item xs={4}>
                <button
                    onClick={() => {
                        props.setSelectedPlayer(props.player)
                    }}
                >
                    <LobbyCell
                        label={props.owner ? 'Skilltree' : 'Watch Skilltree'}
                    ></LobbyCell>
                </button>
            </Grid>
        </Grid>
    )
}

interface AiRowProps {
    player: ClientAiPlayer
    takeSeat: (playerId: number) => void
    clear: (playerId: number) => void
    setSelectedPlayer: (player: ClientAiPlayer) => void
}

const AiRow: React.FC<AiRowProps> = (props) => {
    return (
        <Grid container>
            <Grid item xs={2}>
                <LobbyCell
                    label={'Player ' + (props.player.playerId + 1).toString()}
                    backgroundColor={playerColors[props.player.playerId]}
                ></LobbyCell>
            </Grid>
            <Grid item xs={2}>
                <LobbyCell label={'AI'}></LobbyCell>
            </Grid>
            <Grid item xs={2}>
                <button onClick={() => props.takeSeat(props.player.playerId)}>
                    <LobbyCell label={'Take'}></LobbyCell>
                </button>
            </Grid>
            <Grid item xs={2}>
                <button onClick={() => props.clear(props.player.playerId)}>
                    <LobbyCell label={'Open'}></LobbyCell>
                </button>
            </Grid>
            <Grid item xs={4}>
                <button
                    onClick={() => {
                        props.setSelectedPlayer(props.player)
                    }}
                >
                    <LobbyCell label={'Skilltree'}></LobbyCell>
                </button>
            </Grid>
        </Grid>
    )
}

interface DisplayPlayerViewProps {
    playerName: string | null // playerName of this client
    playerIds: number[]
    players: ClientLobbyPlayer[]
    takeSeat: (playerId: number) => void
    setAi: (playerId: number) => void
    clear: (playerId: number) => void
    setSelectedPlayer: (player: ClientLobbyPlayer) => void
}

const DisplayPlayerView: React.FC<DisplayPlayerViewProps> = (props) => {
    const playerIds = props.playerIds.sort((a, b) => a - b)
    return (
        <Grid container spacing={3}>
            {playerIds.map((playerId, key) => {
                const seatedPlayer = props.players.find(
                    (pl) => pl.playerId === playerId,
                )
                if (seatedPlayer === undefined) {
                    return (
                        <EmptyRow
                            key={key}
                            playerId={playerId}
                            takeSeat={props.takeSeat}
                            setAi={props.setAi}
                        ></EmptyRow>
                    )
                } else if (seatedPlayer.type === 'ai') {
                    return (
                        <AiRow
                            key={key}
                            player={seatedPlayer}
                            takeSeat={props.takeSeat}
                            clear={props.clear}
                            setSelectedPlayer={props.setSelectedPlayer}
                        ></AiRow>
                    )
                } else {
                    // if (seatedPlayer.type === 'human') {
                    return (
                        <HumanRow
                            key={key}
                            player={seatedPlayer}
                            owner={seatedPlayer.name === props.playerName}
                            setSelectedPlayer={props.setSelectedPlayer}
                        ></HumanRow>
                    )
                }
            })}
        </Grid>
    )
}

export default DisplayPlayerView
