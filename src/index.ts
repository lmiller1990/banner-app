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

const updateHistory = (mutation: Mutation) => addMutation(mutations, mutation)

document.addEventListener('mouseup', (e: MouseEvent) => {
  documentOnMouseUp(e, (mutation: Mutation) => {
    mutations = updateHistory(mutation)
  })
})


app.el.addEventListener('mousemove', e => appOnMouseMove(e, mutations))

const state = prepareInitialState(mutations)

for (const snapshot of state) {
  app.add(snapshot)
}