import { Show, createSignal, onCleanup, type Component } from 'solid-js';
import { FindGame } from './FindGame';

const App: Component = () => {
  const [queueing, setQueueing] = createSignal(false);

  const stopQueueing = () => {
    setQueueing(false)
  }

  const startQueueing = () => {
    setQueueing(true)
  }

  onCleanup(() => {
    stopQueueing()
  });

  return (
    <>
      <Show
        when={queueing()}
        fallback={
          <button onClick={startQueueing}>
            Find a Game
          </button>
        }
      >
        <FindGame></FindGame>
        <button onClick={stopQueueing}>Cancel</button>
      </Show>
    </>
  );
};

export default App;
