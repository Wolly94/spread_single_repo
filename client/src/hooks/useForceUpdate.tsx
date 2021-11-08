import { useCallback, useState } from 'react'

const useForceUpdate = (): [number, () => void] => {
    const [value, setValue] = useState(0)
    const incValue = useCallback(() => {
        setValue((v) => v + 1)
    }, [])
    return [value, incValue]
}

export default useForceUpdate
