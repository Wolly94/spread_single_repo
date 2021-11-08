const baseUrl = () => {
    if (
        process.env.NODE_ENV === 'production' ||
        process.env['REACT_APP_NODE_ENV'] === 'production'
    ) {
        console.log('run production')
        return 'http://3.128.245.168:8765/'
    } else if (process.env.NODE_ENV === 'development') {
        console.log('run development')
        return (
            'http://' +
            process.env.WEB_API_BASE_URL +
            ':' +
            process.env.WEB_API_PORT +
            '/'
        )
    }
    return (
        'http://' +
        process.env.WEB_API_BASE_URL +
        ':' +
        process.env.WEB_API_PORT +
        '/'
    )
}

const API_PATH = {
    getToken: baseUrl() + 'token',
    createGame: baseUrl() + 'create-game',
    getFindGame: baseUrl() + 'find-game',
}

export default API_PATH
