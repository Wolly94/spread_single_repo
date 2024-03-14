export const matchmakingApiUrl = (token: string) => {
    return "ws://localhost:5000/join-queue/" + token
}