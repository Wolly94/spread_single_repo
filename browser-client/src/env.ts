export const matchmakingApiUrl = (token: string) => {
    return "ws://localhost:8000/join-queue/" + token
}