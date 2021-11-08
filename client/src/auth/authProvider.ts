const tokenIdentifier = 'token'

const authProvider = {
    getToken: () => {
        const x = localStorage.getItem(tokenIdentifier)
        return x
    },
    setToken: (token: string) => {
        localStorage.setItem(tokenIdentifier, token)
    },
    clear: () => {
        localStorage.removeItem(tokenIdentifier)
    },
}

export default authProvider
