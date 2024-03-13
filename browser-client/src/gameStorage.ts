import { FoundGameResponse } from './foundGameResponse';

const GAME_KEY = "game";
export const getGame = () => {
  let game = localStorage.getItem(GAME_KEY);
  if (game === null) {
    return null
  }
  else {
    return JSON.parse(game) as FoundGameResponse;
  }
};

export const setGame = (game: FoundGameResponse) => {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
};
