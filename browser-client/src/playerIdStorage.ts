import {v4 as uuidv4} from 'uuid';

const generateId = () => {
  const token = uuidv4();
  return token
};

const PLAYER_ID_KEY = "playerId";
export const getPlayerId = () => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (id === null) {
    id = generateId();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
};
