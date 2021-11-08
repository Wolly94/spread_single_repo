import React from 'react'
import { Switch, Route } from 'react-router-dom'
import App from './App'
import Editor from './editor/editor'
import PlayAi from './playAi'
import PlayHuman from './playOnline'
import ReplayView from './replay'

export const PATHS = {
    root: '/',
    editor: '/editor',
    game: '/game',
    playAi: '/playai',
    replay: '/replay',
}

const Routes: React.FC = () => (
    <Switch>
        <Route exact path={PATHS.root} component={App} />
        <Route path={PATHS.editor} component={Editor} />
        <Route path={PATHS.game} component={PlayHuman} />
        <Route path={PATHS.playAi} component={PlayAi} />
        <Route path={PATHS.replay} component={ReplayView} />
    </Switch>
)

export default Routes
