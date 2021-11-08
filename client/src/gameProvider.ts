const gameUrl = 'game-url'

const gameProvider = {
    setSocketUrl: (socketUrl: string) => {
        localStorage.setItem(gameUrl, socketUrl)
    },
    getSocketUrl: () => {
        const x = localStorage.getItem(gameUrl)
        return x
    },
    clear: () => {
        localStorage.removeItem(gameUrl)
    },
}

export default gameProvider
