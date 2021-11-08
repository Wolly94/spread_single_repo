import ClientMessage from "../messages/clientMessage";

export class ClientCommunication<TReceiveMessage, TSenderMessageData> {
  token: string;
  onReceiveMessage: ((message: TReceiveMessage) => void) | null;
  sendMessageToServer: ((message: TSenderMessageData) => void) | null;

  constructor(token: string) {
    this.token = token;
    this.onReceiveMessage = null;
    this.sendMessageToServer = null;
  }

  isReady() {
    return this.onReceiveMessage !== null && this.sendMessageToServer !== null;
  }

  connect(
    sendMessageToServer: (message: ClientMessage<TSenderMessageData>) => void
  ) {
    this.sendMessageToServer = (msg) =>
      sendMessageToServer({ token: this.token, data: msg });
  }

  setReceiver(onReceiveMessage: (msg: TReceiveMessage) => void) {
    this.onReceiveMessage = onReceiveMessage;
  }
}
