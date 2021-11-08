import ClientMessage from 'spread_game/dist/messages/clientMessage'

export interface SocketClient<TReceiveMessage, TSenderMessageData> {
    close: () => void
    onReceiveMessage: (message: TReceiveMessage) => void
    sendMessageToServer: (message: TSenderMessageData) => void
}

class SocketClientImplementation<TReceiveMessage, TSenderMessageData>
    implements SocketClient<TReceiveMessage, TSenderMessageData> {
    socket: WebSocket
    token: string
    url: string
    onReceiveMessage: (message: TReceiveMessage) => void

    constructor(
        toUrl: string,
        token: string,
        onReceiveMessage: (message: TReceiveMessage) => void,
    ) {
        this.socket = new WebSocket(toUrl + '?token=' + token)
        this.token = token
        this.url = toUrl
        this.onReceiveMessage = onReceiveMessage

        this.socket.onopen = () => {
            this.onConnect()
        }
        this.socket.onmessage = (event) => {
            const data: TReceiveMessage = JSON.parse(event.data.toString())
            if (this.onReceiveMessage != null) this.onReceiveMessage(data)
        }
        this.socket.onclose = () => {
            this.onClose()
        }
    }

    close() {
        this.socket.close()
    }

    waitForSocketConnection(callback: () => void) {
        setTimeout(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                callback()
            } else {
                this.waitForSocketConnection(callback)
            }
        }, 100)
    }

    sendMessageToServer(message: TSenderMessageData) {
        const mData: ClientMessage<TSenderMessageData> = {
            token: this.token,
            data: message,
        }
        const m = JSON.stringify(mData)
        this.waitForSocketConnection(() => {
            this.socket.send(m)
        })
    }

    onConnect() {
        console.log('Now connected')
    }

    onClose() {
        console.log('connection with gameserver closed')
    }
}

export default SocketClientImplementation
