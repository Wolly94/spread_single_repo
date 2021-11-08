import { useEffect, useRef, useState } from 'react'

const useEffectWhen = (
    effect: React.EffectCallback,
    deps: React.DependencyList,
    whenDeps: React.DependencyList,
) => {
    const whenRef = useRef<React.DependencyList | null>(null)
    const [whenDepsChanged, setWhenDepsChanged] = useState(false)

    useEffect(() => {
        const changed =
            whenRef.current === null ||
            !whenRef.current.every((w, i) => w === whenDeps[i])
        setWhenDepsChanged(changed)
        whenRef.current = whenDeps
    }, [deps, whenDeps])

    useEffect(() => {
        if (whenDepsChanged) effect()
    }, [whenDepsChanged, effect])
}

export default useEffectWhen
