import {
    Box,
    Grid,
    makeStyles,
    Table,
    TableCell,
    TableRow,
    Typography,
} from '@material-ui/core'
import clsx from 'clsx'
import React, { useState } from 'react'
import { OpenGame } from 'spread_game/dist/messages/findGame/findGameServerMessages'

const useStyles = makeStyles((theme) => ({
    tableRow: {
        '&$hover:hover': {
            backgroundColor: theme.palette.grey.A100,
        },
        '&$selected, &$selected:hover': {
            backgroundColor: theme.palette.grey.A200,
        },
    },
    hover: {},
    selected: {},
    tableCell: {
        textAlign: 'center',
    },
    gameRunning: {
        backgroundColor: '#aa2e25',
    },
    gameOpen: {
        backgroundColor: '#4caf50',
    },
    root: {
        flexGrow: 1,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        marginRight: 'auto',
    },
}))

interface OpenGameProps {
    openGame: OpenGame
}

interface OpenGamesProps {
    openGames: OpenGame[]
    onSelect: (gameUrl: string) => void
}

export const OpenGamesFC: React.FC<OpenGamesProps> = (props) => {
    const classes = useStyles()
    const [selected, setSelected] = useState<string | null>(null)
    return (
        <Table className={classes.root}>
            {props.openGames.map((openGame, index) => {
                return (
                    <TableRow
                        selected={selected === openGame.url}
                        hover={true}
                        onClick={() => {
                            setSelected(openGame.url)
                            props.onSelect(openGame.url)
                        }}
                        key={index}
                        className={classes.tableRow}
                        classes={{
                            hover: classes.hover,
                            selected: classes.selected,
                        }}
                    >
                        <TableCell style={{ width: '75%' }}>
                            <Typography variant="h4">
                                {openGame.joinedPlayers}/{openGame.players}{' '}
                                Players
                            </Typography>
                        </TableCell>
                        <TableCell
                            style={{ width: '25%' }}
                            className={clsx(
                                classes.tableCell,
                                openGame.running
                                    ? classes.gameRunning
                                    : classes.gameOpen,
                            )}
                        >
                            <Typography variant="h4">
                                {openGame.running ? 'Running' : 'Open'}
                            </Typography>
                        </TableCell>
                    </TableRow>
                )
            })}
            <Box paddingBottom={2}></Box>
        </Table>
    )
}

export const OpenGameFC: React.FC<OpenGameProps> = (props) => {
    const classes = useStyles()
    return (
        <Grid container className={classes.row}>
            <Grid item xs={9}>
                {props.openGame.joinedPlayers}/{props.openGame.players} Players
            </Grid>
            <Grid item xs={3}>
                {props.openGame.running && (
                    <Box className={classes.gameRunning}>Running</Box>
                )}
                {!props.openGame.running && (
                    <Box className={classes.gameOpen}>Waiting</Box>
                )}
            </Grid>
        </Grid>
    )
}
