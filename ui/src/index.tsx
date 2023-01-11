import { h, render } from 'preact'
import './main.css'
import { Home } from './pages/home'
import { initKeyBindings } from './services/bindings'

h

initKeyBindings()
render(<Home />, document.getElementById('app')!)
