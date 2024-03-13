from typing import Awaitable, Callable, Optional
from anyio import create_memory_object_stream
from attr import dataclass

@dataclass
class FoundGameResponse:
    url: str

@dataclass
class Player:
    token: str
    trigger: Callable[[FoundGameResponse], Awaitable[None]]

class PlayerQueue:
    def __init__(self):
        self.send_add_player_stream, self.receive_add_player_stream = create_memory_object_stream[Player]()
        self.players: list[Player] = []

    def add(self, token: str):
        send_one_player_stream, receive_one_player_stream = create_memory_object_stream[FoundGameResponse]()
        self.q.put(Player(token, trigger=send_one_player_stream.send))
        return receive_one_player_stream

    def match(self) -> Optional[list[Player]]:
        if len(self.players) >= 2:
            res, self.players = self.players[:2], self.players[2:]
            return res
        else:
            return None

    def run(self):
        while True:
            pass
