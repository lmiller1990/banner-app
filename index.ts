console.log('ok')

import { unitToPx, grid, GridOptions, GridState, normalizeCursorPos } from './grid'

const $ = (q: string) => document.querySelector(q)

const $app = $('#app')!
const width = $app.clientWidth
const height = $app.clientHeight
console.log(width, height)

let hUnits = 30
let wUnits = 53
const state: GridState = {
  coordinates: {
    height: {
      units: hUnits,
      px: height
    },
    width: {
      units: wUnits,
      px: width
    },
  },
  element: {
    pos: {
      top: 1,
      left: 1,
      width: 5,
      height: 5,
    }
  }
}

const render = (state: GridState, options: GridOptions) => {
  $app.innerHTML = ''
  const $el = document.createElement('div')
  $el.className = 'el'
  $el.style.left = state.element.pos.left * wUnits + 'px'
  $el.style.top = state.element.pos.top + hUnits + 'px'
  $el.style.width = state.element.pos.width * wUnits + 'px'
  $el.style.height = state.element.pos.height * hUnits + 'px'
  $app.appendChild($el)
}

const getPos = (e: MouseEvent) => {
  const rect = $app.getBoundingClientRect()
  const x = e.clientX - rect.left // x pos
  const y = e.clientY - rect.top  // y pos
  return { x, y }
}

render(state, {
})

let drag = false
$app.addEventListener('mousemove', (e) => {
  const evt = e as MouseEvent
  if (!drag) {
    return
  }

  const newState = grid(
    state,
    {
      handle: 'bottom-right',
      cursor: getPos(e)
    }
  )
})
