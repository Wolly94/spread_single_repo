from typing import Union

from fastapi import FastAPI, WebSocket

from anyio import create_memory_object_stream, create_task_group, run
from anyio.streams.memory import MemoryObjectReceiveStream

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/queue")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.websocket("/join_queue/{token}")
async def websocket_endpoint(
    *,
    websocket: WebSocket,
    token: str,
):
    await websocket.accept()
    send_one_player_stream, receive_one_player_stream = create_memory_object_stream[str]()
    async with create_task_group() as tg:
    send_add_player_stream.send((token, receive_one_player_stream))
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")


async def process_items(receive_stream: MemoryObjectReceiveStream[str]) -> None:
    players = []
    async with receive_stream:
        async for token in receive_stream:
            print('received', token)
            players += [token]
