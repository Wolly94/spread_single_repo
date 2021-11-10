const baseUrl = () => {
    return (
        'http://' +
        process.env.REACT_APP_WEB_API_BASE_URL +
        ':' +
        process.env.REACT_APP_WEB_API_PORT +
        '/'
    )
}

const API_PATH = {
    getToken: () => baseUrl() + 'token',
    createGame: () => baseUrl() + 'create-game',
    getFindGame: () => baseUrl() + 'find-game',
}

export default API_PATH
