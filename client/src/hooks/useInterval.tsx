import { useMemo, useState } from 'react'
import useEffectWhen from './useEffectWhen'
import useForceUpdate from './useForceUpdate'

const useInterval = (
    callback: () => void,
    ms: number,
): [boolean, () => void, () => void] => {
    const [runningId, setRunningId] = useState<NodeJS.Timeout | null>(null)
    const [callValue, call] = useForceUpdate()

    const paused = useMemo(() => runningId === null, [runningId])

    const [startValue, start] = useForceUpdate()
    const [stopValue, stop] = useForceUpdate()

    // this is responsible for starting
    useEffectWhen(
        () => {
            if (paused) {
                const newId = setInterval(() => {
                    call()
                }, ms)
                setRunningId(newId)
            }
            return () => {
                if (!paused) stop()
            }
        },
        [runningId, ms, call],
        [startValue],
    )

    useEffectWhen(
        () => {
            if (runningId !== null) {
                clearInterval(runningId)
                setRunningId(null)
            }
        },
        [runningId],
        [stopValue],
    )

    useEffectWhen(
        () => {
            if (!paused) callback()
        },
        [callback, paused],
        [callValue],
    )

    return [paused, start, stop]
}

export default useInterval
