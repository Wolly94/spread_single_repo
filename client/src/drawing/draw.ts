import {
    ClientBubble,
    ClientCell,
} from 'spread_game/dist/messages/inGame/clientGameState'
import { MapCell } from 'spread_game/dist/spreadGame/map/map'

export const neutralColor = 'grey'
export const selectedColor = 'black'
export const playerColors = ['blue', 'red', 'green', 'yellow']

const drawCircle = (
    context: CanvasRenderingContext2D,
    center: [number, number],
    radius: number,
    fillColor?: string,
    outline?: {
        color: string
        width: number
    },
    text?: {
        value: string
        fontSize: number
    },
) => {
    context.beginPath()
    if (fillColor) context.fillStyle = fillColor
    if (outline) {
        context.strokeStyle = outline.color
        context.lineWidth = outline.width
    }
    context.arc(center[0], center[1], radius, 0, 2 * Math.PI)
    if (outline) context.stroke()
    if (fillColor) context.fill()

    if (text) {
        context.lineWidth = 1
        context.fillStyle = 'black'
        context.strokeStyle = 'black'
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.font = Math.ceil(text.fontSize).toString() + 'px Arial'
        context.fillText(text.value, center[0], center[1])
    }
}

export const drawBubble = (
    context: CanvasRenderingContext2D,
    bubble: ClientBubble,
    scale: number,
) => {
    const fillColor =
        bubble.playerId != null ? playerColors[bubble.playerId] : neutralColor
    const additionalAttack = bubble.attackCombatAbilities
    drawCircle(
        context,
        [bubble.position[0] * scale, bubble.position[1] * scale],
        bubble.radius * scale,
        fillColor,
        additionalAttack > 0
            ? { color: 'darkred', width: additionalAttack / 5 }
            : undefined,
        {
            value: Math.floor(bubble.units).toString(),
            fontSize: 17 * scale,
        },
    )
    if (bubble.infected) {
        drawCircle(
            context,
            [bubble.position[0] * scale, bubble.position[1] * scale],
            (bubble.radius * scale) / 5,
            'darkgreen',
            undefined,
            undefined,
        )
    }
}

export const drawCell = (
    context: CanvasRenderingContext2D,
    cell: ClientCell,
    selected: boolean,
    scale: number,
) => {
    const fillColor =
        cell.playerId != null ? playerColors[cell.playerId] : neutralColor
    const additionalDefenseAbilities =
        cell.data === null ? 0 : cell.data.defenderCombatAbilities
    const outline = selected
        ? { color: selectedColor, width: 10 * scale }
        : additionalDefenseAbilities > 0
        ? { color: 'darkblue', width: additionalDefenseAbilities / 5 }
        : { color: 'black', width: 1 }
    drawCircle(
        context,
        [cell.position[0] * scale, cell.position[1] * scale],
        cell.radius * scale,
        fillColor,
        outline,
        cell.data === null
            ? undefined
            : {
                  value: Math.floor(cell.data.units).toString(),
                  fontSize: 17 * scale,
              },
    )
    if (cell.infected) {
        drawCircle(
            context,
            [cell.position[0] * scale, cell.position[1] * scale],
            (cell.radius * scale) / 5,
            'darkgreen',
        )
    }
    if (cell.data !== null && cell.playerId !== null) {
        drawCircle(
            context,
            [cell.position[0] * scale, cell.position[1] * scale],
            cell.data.newBubbleRadius * scale,
            undefined,
            { color: 'black', width: 2 },
        )
        drawCircle(
            context,
            [cell.position[0] * scale, cell.position[1] * scale],
            cell.data.currentUnitsRadius * scale,
            undefined,
            { color: 'black', width: 2 * scale },
        )
    }
}

export const drawMapCell = (
    context: CanvasRenderingContext2D,
    mapCell: MapCell,
    selected: boolean,
    scale: number,
) => {
    const cell: ClientCell = {
        ...mapCell,
        data: {
            defenderCombatAbilities: 0,
            attackerCombatAbilities: 0,
            membraneValue: 0,
            units: mapCell.units,
            currentUnitsRadius: 0,
            newBubbleRadius: 0,
        },
        infected: false,
    }
    drawCell(context, cell, selected, scale)
}
