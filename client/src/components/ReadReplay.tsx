import React from 'react'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { ReadFile } from '../fileService'

interface ReadReplayProps {
    callback: (replay: SpreadReplay | null) => void
}

const ReadReplay: React.FC<ReadReplayProps> = (props) => {
    const handleRead = (data: string) => {
        const parsed: SpreadReplay = JSON.parse(data)
        // TODO validate read data
        console.log(JSON.stringify(parsed))
        props.callback(parsed)
    }

    return (
        <ReadFile allowedFileEndings={['.spread.map']} handleInput={handleRead}>
            Load Replay
        </ReadFile>
    )
}

export default ReadReplay
