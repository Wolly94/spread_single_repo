import { Box, Grid } from '@material-ui/core'
import React, { useRef, useEffect, useState } from 'react'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import { drawBubble, drawCell } from '../drawing/draw'

interface ClientGameStateViewProps {
    map: SpreadMap
    state: ClientGameState
}

const ClientGameStateView: React.FC<ClientGameStateViewProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const bboxName = 'canvas_bbox'
    const [bboxSize, setBboxSize] = useState<[number, number]>([1, 1])

    useEffect(() => {
        const bbox = document.getElementById(bboxName)
        if (bbox !== null && canvasRef.current !== null) {
            const maxWidth = Math.min(bbox.offsetWidth, window.innerWidth)
            const whRatio = props.map.height / props.map.width
            //const maxHeight = Math.min(bbox.offsetHeight, window.innerHeight)
            const maxHeight = Math.min(whRatio * maxWidth, window.innerHeight)
            const resHeight = maxWidth * whRatio
            const [newWidth, newHeight] =
                resHeight > maxHeight
                    ? [maxWidth / (resHeight / maxHeight), maxHeight]
                    : [maxWidth, resHeight]
            if (newWidth !== bboxSize[0] || newHeight !== bboxSize[1])
                setBboxSize([newWidth, newHeight])
        }
    }, [bboxSize, props.map])

    useEffect(() => {
        const scaleFactor = Math.max(
            props.map.width / bboxSize[0],
            props.map.height / bboxSize[1],
        )
        if (canvasRef.current != null) {
            const context = canvasRef.current.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, bboxSize[0], bboxSize[1])
                if (props.state.deadlyEnvironment) {
                    context.fillStyle = 'grey'
                    context.fillRect(0, 0, bboxSize[0], bboxSize[1])
                }
                props.state.cells.forEach((cell) => {
                    drawCell(context, cell, false, 1 / scaleFactor)
                })
                props.state.bubbles.forEach((bubble) => {
                    drawBubble(context, bubble, 1 / scaleFactor)
                    /*                     drawEntityScaled(
                        context,
                        bubble,
                        false,
                        true,
                        1 / scaleFactor,
                    ) */
                })
            }
        }
    }, [props, bboxSize])

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box id={bboxName} width="100%" height="100%">
                    <canvas
                        style={{
                            border: '1px solid black',
                            position: 'relative',
                            //width: '100%',
                            //height: '100%',
                        }}
                        ref={canvasRef}
                        height={bboxSize[1]}
                        width={bboxSize[0]}
                    />
                </Box>
            </Grid>
        </Grid>
    )
}

export default ClientGameStateView
