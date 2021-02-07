import { Mutation, addMutation } from "./core"
import { appOnMouseMove, createApp, documentOnMouseUp, prepareInitialState } from "./ui"

const app = createApp()
document.body.appendChild(app.el)

let mutations: Mutation[] = [
  {
    id: '1',
    text: '',
    styles: {
      zIndex: 0,
      top: 100,
      left: 100,
      width: 50,
      height: 50,
      background: 'red',
      color: 'white'
    }
  }
]

app.el.addEventListener('mousemove', e => appOnMouseMove(e))

const state = prepareInitialState(mutations)

for (const snapshot of state) {
  app.add(snapshot)
}