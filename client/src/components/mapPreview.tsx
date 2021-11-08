import { Box } from '@material-ui/core'
import React, { useEffect, useRef } from 'react'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import { drawMapCell } from '../drawing/draw'

interface MapPreviewProps {
    map: SpreadMap
    width: number
    height: number
}

const MapPreview: React.FC<MapPreviewProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const scaleFactor = Math.max(
            props.map.width / props.width,
            props.map.height / props.height,
        )
        if (canvasRef.current != null) {
            const context = canvasRef.current.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, props.width, props.height)
                props.map.cells.forEach((cell) => {
                    drawMapCell(context, cell, false, 1 / scaleFactor)
                })
            }
        }
    }, [props])

    return (
        <Box>
            <canvas
                style={{ border: '1px solid black' }}
                ref={canvasRef}
                height={props.height}
                width={props.width}
            />
        </Box>
    )
}

export default MapPreview
