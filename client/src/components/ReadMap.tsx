import React from 'react'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { SpreadMap, validateMap } from 'spread_game/dist/spreadGame/map/map'
import { ReadFile } from '../fileService'

interface ReadMapProps {
    callback: (map: SpreadMap | null) => void
}

const ReadMap: React.FC<ReadMapProps> = (props) => {
    const handleRead = (data: string, fileName: string) => {
        const fileEnding = fileName.split('.')
        if (fileEnding[2] === 'rep') {
            const rep: SpreadReplay = JSON.parse(data)
            const map = rep.map
            const r = validateMap(map)
            props.callback(r.map)
        } else if (fileEnding[1] === 'spread') {
            const m: SpreadMap = JSON.parse(data)
            const r = validateMap(m)
            console.log(JSON.stringify(r.message))
            props.callback(r.map)
        } else props.callback(null)
    }

    return (
        <ReadFile
            allowedFileEndings={['.spread', '.rep']}
            handleInput={handleRead}
        >
            Load Map
        </ReadFile>
    )
}

export default ReadMap
