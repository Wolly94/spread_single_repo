import { Box, Grid } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ClientGameState,
    ClientCell,
} from 'spread_game/dist/messages/inGame/clientGameState'
import {
    ClientInGameMessage,
    SendUnits,
} from 'spread_game/dist/messages/inGame/clientInGameMessage'
import { entityContainsPoint } from 'spread_game/dist/spreadGame/entites'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import { drawBubble, drawCell } from '../drawing/draw'

interface GameCanvasProps {
    map: SpreadMap
    clientGameState: ClientGameState
    playerId: number | null
    sendMessageToServer: (message: ClientInGameMessage) => void
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    clientGameState,
    playerId,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedCellIds, setSelectedCellIds] = useState<number[]>([])
    const [mouseDown, setMouseDown] = useState(false)
    const [currentTime, setCurrentTime] = useState(Date.now())
    const [oldClientTime, setOldClientTime] = useState(0)

    const scaleFactor = useMemo(() => {
        const ratio = Math.min(
            window.screen.width / props.map.width,
            window.screen.height / props.map.height,
        )
        return ratio * 0.8
    }, [props.map])

    const getCanvasRect = useCallback(() => {
        if (canvasRef.current !== null) {
            const rect = canvasRef.current.getBoundingClientRect()
            return rect
        } else {
            return null
        }
    }, [])

    const getMapCoordinates = useCallback(
        (ev: MouseEvent): [number, number] => {
            const canvasRect = getCanvasRect()
            if (canvasRect === null) return [ev.x, ev.y]
            const x = (ev.x - canvasRect.left) / scaleFactor
            const y = (ev.y - canvasRect.top) / scaleFactor
            return [x, y]
        },
        [getCanvasRect, scaleFactor],
    )

    const cellBelowCursor = useCallback(
        (x: number, y: number): ClientCell | null => {
            const cell = clientGameState.cells.find((c) =>
                entityContainsPoint(c, [x, y]),
            )
            if (cell === undefined) return null
            else return cell
        },
        [clientGameState],
    )

    const onMouseDown = useCallback(
        (ev: MouseEvent) => {
            const [x, y] = getMapCoordinates(ev)
            const cell = cellBelowCursor(x, y)
            if (cell != null && cell.playerId === playerId) {
                setMouseDown(true)
                setSelectedCellIds([cell.id])
                console.log('SELECTED')
            } else {
                setSelectedCellIds([])
            }
        },
        [cellBelowCursor, playerId, getMapCoordinates],
    )

    const onMouseMove = useCallback(
        (ev: MouseEvent) => {
            const [x, y] = getMapCoordinates(ev)
            if (mouseDown && selectedCellIds.length > 0) {
                const cell = cellBelowCursor(x, y)
                if (
                    cell != null &&
                    cell.playerId === playerId &&
                    !selectedCellIds.some((cId) => cId === cell.id)
                ) {
                    setSelectedCellIds([...selectedCellIds, cell.id])
                    console.log('SELECTED')
                }
            }
        },
        [
            selectedCellIds,
            mouseDown,
            playerId,
            cellBelowCursor,
            getMapCoordinates,
        ],
    )

    const onMouseUp = useCallback(
        (ev: MouseEvent) => {
            const [x, y] = getMapCoordinates(ev)
            if (mouseDown && selectedCellIds.length > 0) {
                const cell = cellBelowCursor(x, y)
                if (cell != null) {
                    const sendUnits: SendUnits = {
                        senderIds: selectedCellIds,
                        receiverId: cell.id,
                    }
                    props.sendMessageToServer({
                        type: 'sendunits',
                        data: sendUnits,
                    })
                    console.log('SENDUNITS')
                }
            }
            setMouseDown(false)
            setSelectedCellIds([])
        },
        [mouseDown, cellBelowCursor, props, selectedCellIds, getMapCoordinates],
    )

    // update mouse event methods on change
    // render on canvas
    useEffect(() => {
        if (canvasRef.current != null && clientGameState != null) {
            if (clientGameState.timePassedInMs !== oldClientTime) {
                /*                 const newCurrentTime = Date.now()
                console.log(
                    'ms: ' +
                        (newCurrentTime - currentTime) +
                        ' expected: ' +
                        (
                            clientGameState.timePassedInMs - oldClientTime
                        ).toString(),
                )
                setCurrentTime(newCurrentTime) */
                setOldClientTime(clientGameState.timePassedInMs)

                const canvas = canvasRef.current
                canvas.onmousedown = (ev) => onMouseDown(ev)
                canvas.onmousemove = (ev) => onMouseMove(ev)
                canvas.onmouseup = (ev) => onMouseUp(ev)
                const context = canvas.getContext('2d')
                if (context != null) {
                    context.clearRect(0, 0, props.map.width, props.map.height)
                    clientGameState.cells.forEach((cell) => {
                        drawCell(
                            context,
                            cell,
                            selectedCellIds.some((cId) => cId === cell.id),
                            scaleFactor,
                        )
                    })
                    clientGameState.bubbles.forEach((bubble) => {
                        drawBubble(context, bubble, scaleFactor)
                    })
                }
            }
        }
    }, [
        selectedCellIds,
        clientGameState,
        mouseDown,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        playerId,
        props.map,
        scaleFactor,
        currentTime,
        oldClientTime,
    ])

    return (
        <Grid container>
            <Grid item xs={12}>
                <canvas
                    style={{ border: '1px solid black' }}
                    ref={canvasRef}
                    height={props.map.height * scaleFactor}
                    width={props.map.width * scaleFactor}
                />
            </Grid>
            <Grid item xs={12}>
                <label>Player Id: {playerId}</label>
                <label>
                    Time passed:{' '}
                    {Math.floor(clientGameState.timePassedInMs / 1000)}
                </label>
            </Grid>
        </Grid>
    )
}

export default GameCanvas
