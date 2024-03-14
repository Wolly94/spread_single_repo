import { isLeft } from 'fp-ts/lib/Either';
import { FoundGameResponse } from './foundGameResponse';

const GAME_KEY = "game";
export const getGame = () => {
  let game = localStorage.getItem(GAME_KEY);
  if (game === null) {
    return null
  }
  else {
    let parsed = JSON.parse(game);
    let decoded = FoundGameResponse.decode(parsed);
    if (isLeft(decoded)) {
      console.log(`Failed to parse FoundGameResponse ${parsed}`);
      console.log(`error is : ${JSON.stringify(decoded.left)}`)
      return null;
    } else {
      return decoded.right
    }
  }
};

export const setGame = (game: FoundGameResponse) => {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
};

export const unsetGame = () => {
  localStorage.removeItem(GAME_KEY)
};
