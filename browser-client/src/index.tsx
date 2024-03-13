/* @refresh reload */
import { render } from 'solid-js/web';
import { Route, Router } from "@solidjs/router";

import './index.css';
import App from './App';
import { Game } from './Game';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <Router>
      <Route path="/" component={App} />
      <Route path="/game" component={Game} />
</Router>, root!);