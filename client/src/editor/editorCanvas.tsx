import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { entityContainsPoint } from 'spread_game/dist/spreadGame/entites'
import {
    SpreadMap,
    MapCell,
    addCellToMap,
    updateCellInMap,
    removeCellFromMap,
} from 'spread_game/dist/spreadGame/map/map'
import { drawMapCell } from '../drawing/draw'
import EditorForm from './editorForm'

interface MouseDownProps {
    position: [number, number]
    clickedEntityCenter: [number, number] | null
}

interface EditorCanvasProps {
    map: SpreadMap
    setMap: React.Dispatch<React.SetStateAction<SpreadMap>>
    unselectCell: number
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
    map,
    setMap,
    ...props
}) => {
    const width = map.width
    const height = map.height
    const defaultRadius = 50
    const defaultUnits = 50
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [usedIds, setUsedIds] = useState<number[]>([])
    const [selectedCellId, setSelectedCellId] = useState<number | null>(null)
    const [mouseDownProps, setMouseDownProps] = useState<MouseDownProps | null>(
        null,
    )
    const getCanvasRect = useCallback(() => {
        if (canvasRef.current !== null) {
            const rect = canvasRef.current.getBoundingClientRect()
            return rect
        } else {
            return null
        }
    }, [])
    //const [map, setMap] = useState(props.map)
    const selectedCell = useMemo(() => {
        const c = map.cells.find((cell) => cell.id === selectedCellId)
        if (c === undefined) return null
        else return c
    }, [selectedCellId, map])

    useEffect(() => {
        setSelectedCellId(null)
    }, [props.unselectCell])

    const createCell = useCallback(
        (position: [number, number]) => {
            const nextId = Math.max(0, ...usedIds) + 1
            const cell: MapCell = {
                id: nextId,
                playerId: null,
                position: position,
                radius: defaultRadius,
                units: defaultUnits,
            }
            const r = addCellToMap(cell, map)
            if (r.error !== null) return null
            else {
                setUsedIds([...usedIds, nextId])
                setMap(r.map)
                return nextId
            }
        },
        [usedIds, map, setMap],
    )

    const updateCell = useCallback(
        (cell: MapCell) => {
            const r = updateCellInMap(cell, map)
            if (r.error !== null) return r.error
            setMap(r.map)
            return null
        },
        [map, setMap],
    )

    const removeCell = useCallback(
        (cellId: number) => {
            const newMap = removeCellFromMap(cellId, map)
            setMap(newMap)
        },
        [map, setMap],
    )

    const onMouseDown = useCallback(
        (ev: MouseEvent) => {
            const canvasRect = getCanvasRect()
            if (canvasRect === null) return
            const x = ev.x - canvasRect.left
            const y = ev.y - canvasRect.top
            const cell = map.cells.find((c) => entityContainsPoint(c, [x, y]))
            if (cell !== undefined) {
                setMouseDownProps({
                    position: [x, y],
                    clickedEntityCenter: cell.position,
                })
                setSelectedCellId(cell.id)
            } else {
                const cellId = createCell([x, y])
                if (cellId !== null) {
                    setSelectedCellId(cellId)
                    if (selectedCell !== null) {
                        setMouseDownProps({
                            position: [x, y],
                            clickedEntityCenter: selectedCell.position,
                        })
                    }
                }
            }
        },
        [map, createCell, selectedCell, getCanvasRect],
    )

    const onMouseMove = useCallback(
        (ev: MouseEvent) => {
            if (
                selectedCell !== null &&
                mouseDownProps !== null &&
                mouseDownProps.clickedEntityCenter !== null
            ) {
                const canvasRect = getCanvasRect()
                if (canvasRect === null) return
                const x = ev.x - canvasRect.left
                const y = ev.y - canvasRect.top
                const diff = [
                    x - mouseDownProps.position[0],
                    y - mouseDownProps.position[1],
                ]
                const newPos: [number, number] = [
                    mouseDownProps.clickedEntityCenter[0] + diff[0],
                    mouseDownProps.clickedEntityCenter[1] + diff[1],
                ]
                selectedCell.position = newPos
                const error = updateCell(selectedCell)
                if (error !== null) {
                    removeCell(selectedCell.id)
                    setMouseDownProps({
                        ...mouseDownProps,
                        clickedEntityCenter: null,
                    })
                    setSelectedCellId(null)
                }
            } else if (
                selectedCell !== null &&
                mouseDownProps !== null &&
                mouseDownProps.clickedEntityCenter === null
            ) {
                setSelectedCellId(null)
                setMouseDownProps(null)
            }
        },
        [mouseDownProps, removeCell, selectedCell, updateCell, getCanvasRect],
    )

    const onMouseUp = useCallback((ev: MouseEvent) => {
        setMouseDownProps(null)
    }, [])

    useEffect(() => {
        if (canvasRef.current != null) {
            const canvas = canvasRef.current
            canvas.onmousedown = (ev) => onMouseDown(ev)
            canvas.onmousemove = (ev) => onMouseMove(ev)
            canvas.onmouseup = (ev) => onMouseUp(ev)
            const context = canvas.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, width, height)
                map.cells.forEach((cell) => {
                    drawMapCell(context, cell, false, 1)
                })
                if (selectedCell != null) {
                    drawMapCell(context, selectedCell, true, 1)
                }
            }
        }
    }, [map, selectedCell, height, width, onMouseDown, onMouseMove, onMouseUp])

    return (
        <Box display="flex">
            <Box width={width}>
                <canvas
                    style={{ border: '1px solid black' }}
                    ref={canvasRef}
                    height={map.height}
                    width={map.width}
                />
            </Box>
            {selectedCell !== null && (
                <Box paddingLeft={3} width={400}>
                    <EditorForm
                        selectedCell={selectedCell}
                        map={map}
                        setMap={setMap}
                        removeCell={removeCell}
                    ></EditorForm>
                </Box>
            )}
        </Box>
    )
}

export default EditorCanvas
