import UrlResponse from 'spread_game/dist/messages/general/urlResponse'
import { apiRequest, HttpVerb } from './base'
import API_PATH from './urls'

export interface CreateGameBody {}

export const createGameRequest = () => {
    return apiRequest<UrlResponse>(API_PATH.createGame, HttpVerb.POST, {})
}

export const getFindGameServer = () => {
    return apiRequest<UrlResponse>(API_PATH.getFindGame, HttpVerb.GET, {})
}
