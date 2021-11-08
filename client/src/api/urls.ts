const baseUrl = () => {
    if (
        process.env.NODE_ENV === 'production' ||
        process.env['REACT_APP_NODE_ENV'] === 'production'
    ) {
        console.log('run production')
        return 'http://3.128.245.168:8765/'
    } else if (process.env.NODE_ENV === 'development') {
        console.log('run development')
        return 'http://localhost:8765/'
    }
    return 'http://localhost:8765/'
}

const API_PATH = {
    getToken: baseUrl() + 'token',
    createGame: baseUrl() + 'create-game',
    getFindGame: baseUrl() + 'find-game',
}

export default API_PATH
