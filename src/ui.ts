import {
  addMutation,
  createGlobalState,
  deriveHandles,
  getState,
  HandlePosition,
  keys,
  Mutation,
  WorldState
} from "./core"
import { myH } from "./utils"

const scale = 0.5
const size = 10
const handleColor = 'pink'
export const width = 1280 * scale
export const height = 720 * scale

function $<T extends HTMLElement>(q: string) {
  const el = document.querySelector<T>(q)
  if (!el) {
    throw Error(`No element found for selector ${q}`)
  }
  return el
}

function $$<T extends HTMLElement>(q: string) {
  return Array.from(document.querySelectorAll<T>(q))
}

interface Props {
  styles?: Record<string, any>
}

const foo = myH('div', { 
  style: { 
    top: '10px' 
  }, 
  dataset: {
    el: 'asdf',
  },
  title: 'foo'
}, [
  myH('div', {}, 'ok!')
])
console.log(foo)
document.body.appendChild(foo)

// function drawTools(rules: typeof supportedRules) {
//   const map = rules.map(rule => {
//     const el = h('div')
//     const label = h('label')
//     label.innerText = rule
//     const input = h('input', { value: 0 })
//   })
// }

const h = (type: string, props: Props = {}, dataset: Record<string, string> = {}, children: HTMLElement[] = []) => {
  const el = document.createElement(type)
  el.style.position = 'absolute'

  for (const [key, val] of Object.entries(dataset)) {
    el.dataset[key] = val
  }

  if (props.styles) {
    for (const [key, val] of Object.entries(props.styles)) {
      if (['top', 'left', 'width', 'height'].includes(key)) {
        const k = key as 'top' | 'left' | 'width' | 'height'
        el.style[k] = `${val}px`
      } else {
        const k = key as 'background'
        el.style[k] = val
      }
    }
  }

  if (children) {
    for (const c of children) {
      el.appendChild(c)
    }
  }

  return el
}

const resetGlobalState = () => {
  for (const k of Object.keys(globalState)) {
    if (k !== 'mutations') {
      const key = k as keyof Omit<WorldState<DraggingCache>, 'mutations'>
      globalState[key] = undefined
    }
  }
}

interface DraggingCache {
  app: HTMLElement
  activeElement: HTMLElement
  handleElements: {
    tr: HTMLElement
    tl: HTMLElement
    br: HTMLElement
    bl: HTMLElement
  }
  activeElementPreviousMutation: Mutation
}

interface ResizingCache extends DraggingCache {
  activeHandlePosition: HandlePosition
}

type ActionCache = DraggingCache | ResizingCache

export const globalState = createGlobalState<ActionCache>()

export const getPosRelativeToEl = (e: MouseEvent, el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const cursorX = e.clientX - rect.left
  const cursorY = e.clientY - rect.top
  return { cursorX, cursorY }
}

interface Rect {
  top: number
  left: number
  height: number
  width: number
}

export const getBoundingRectRelTo = (el: HTMLElement, relativeTo: HTMLElement): Rect => {
  const elRect = el.getBoundingClientRect()
  const relToRect = relativeTo.getBoundingClientRect()

  return {
    left: elRect.left - relToRect.left,
    top: elRect.top - relToRect.top,
    height: elRect.height,
    width: elRect.width,
  }
}


export function createApp() {
  const app = h('div', { styles: { height, width, background: 'blue' } }, { el: 'app' })

  return {
    el: app,
    add: (layer: Layer) => {
      layer.handles.forEach(handle => app.appendChild(handle))
      app.appendChild(layer.element)

      layer.element.addEventListener('mousedown', (e: MouseEvent) => {
        const { cursorX, cursorY } = getPosRelativeToEl(e, app)
        globalState.clickX = cursorX
        globalState.clickY = cursorY
      })
    }
  }
}

export const handleOnMouseDown = (e: MouseEvent, elementId: string, handlePosition: HandlePosition) => {
  const app = $('[data-el="app"]')
  const { cursorX, cursorY } = getPosRelativeToEl(e, app)
  globalState.activeElementId = elementId
  globalState.action = 'resizing'
  globalState.clickX = cursorX
  globalState.clickY = cursorY

  const cache: ResizingCache = {
    app,
    handleElements: {
      tr: $(`[data-handle="el-${globalState.activeElementId}-tr"]`),
      tl: $(`[data-handle="el-${globalState.activeElementId}-tl"]`),
      br: $(`[data-handle="el-${globalState.activeElementId}-br"]`),
      bl: $(`[data-handle="el-${globalState.activeElementId}-bl"]`),
    },
    activeElement: $(`[data-el="${globalState.activeElementId}"]`),
    activeElementPreviousMutation: globalState.mutations.reverse().find(x => x.id === globalState.activeElementId)!,
    activeHandlePosition: handlePosition
  }
  globalState.actionCache = cache
}

export const elementOnMouseDown = (e: MouseEvent, elementId: string) => {
  globalState.activeElementId = elementId
  globalState.action = 'dragging'

  const cache: DraggingCache = {
    app: $('[data-el="app"]'),
    handleElements: {
      tr: $(`[data-handle="el-${globalState.activeElementId}-tr"]`),
      tl: $(`[data-handle="el-${globalState.activeElementId}-tl"]`),
      br: $(`[data-handle="el-${globalState.activeElementId}-br"]`),
      bl: $(`[data-handle="el-${globalState.activeElementId}-bl"]`),
    },
    activeElement: $(`[data-el="${globalState.activeElementId}"]`),
    activeElementPreviousMutation: globalState.mutations.reverse().find(x => x.id === globalState.activeElementId)!
  }
  globalState.actionCache = cache
}

export const appOnMouseMove = (e: MouseEvent) => {
  if (globalState.action === 'dragging') {
    drag(e, must(globalState, 'actionCache'))
  }

  if (globalState.action === 'resizing') {
    resize(e, must(globalState, 'actionCache'))
  }
}

export const documentOnMouseUp = (e: MouseEvent) => {
  if (globalState.action === 'dragging') {
    const actionCache = must<DraggingCache>(globalState, 'actionCache')

    const { cursorX, cursorY } = getPosRelativeToEl(e, actionCache.app)
    const dx = cursorX - must<number>(globalState, 'clickX')
    const dy = cursorY - must<number>(globalState, 'clickY')
    const mutation: Mutation = {
      ...actionCache.activeElementPreviousMutation,
      styles: {
        ...actionCache.activeElementPreviousMutation.styles,
        left: actionCache.activeElementPreviousMutation.styles.left + dx,
        top: actionCache.activeElementPreviousMutation.styles.top + dy,
      }
    }

    globalState.mutations = addMutation(globalState.mutations, mutation)
  }

  if (globalState.action === 'resizing') {
    const actionCache = must<ResizingCache>(globalState, 'actionCache')
    const { left, top, width, height } = getBoundingRectRelTo(actionCache.activeElement, $('[data-el="app"]'))

    const mutation: Mutation = {
      ...actionCache.activeElementPreviousMutation,
      styles: {
        ...actionCache.activeElementPreviousMutation.styles,
        left,
        top,
        width,
        height,
      }
    }
    globalState.mutations = addMutation(globalState.mutations, mutation)
  }

  resetGlobalState()
}

document.addEventListener('mouseup', documentOnMouseUp)

declare global {
  interface Window {
    getMutations: () => void
  }
}

window.getMutations = () => {
  return globalState.mutations
}

function must<T extends (number | string | object)>(obj: WorldState<DraggingCache>, key: keyof WorldState<DraggingCache>) {
  if (!obj[key]) {
    console.log(`State is`, globalState)
    throw Error(`Expected ${key} to be defined`)
  }
  return obj[key] as T
}

const drag = (e: MouseEvent, cache: DraggingCache) => {
  const { cursorX, cursorY } = getPosRelativeToEl(e, cache.app)
  const dx = cursorX - must<number>(globalState, 'clickX')
  const dy = cursorY - must<number>(globalState, 'clickY')
  cache.activeElement.style.left = `${cache.activeElementPreviousMutation.styles.left + dx}px`
  cache.activeElement.style.top = `${cache.activeElementPreviousMutation.styles.top + dy}px`

  const handlePositions = deriveHandles(cache.activeElementPreviousMutation, size)
  keys(cache.handleElements).forEach((handle) => {
    cache.handleElements[handle].style.left = `${handlePositions[handle].left + dx}px`
    cache.handleElements[handle].style.top = `${handlePositions[handle].top + dy}px`
  })
}

const resize = (e: MouseEvent, cache: ResizingCache) => {
  const { cursorX, cursorY } = getPosRelativeToEl(e, cache.app)
  const dx = cursorX - must<number>(globalState, 'clickX')
  const dy = cursorY - must<number>(globalState, 'clickY')

  const handlePositions = deriveHandles(cache.activeElementPreviousMutation, size)

  if (cache.activeHandlePosition === 'br') {
    // adjust shape
    cache.activeElement.style.width = `${cache.activeElementPreviousMutation.styles.width + dx}px`
    cache.activeElement.style.height = `${cache.activeElementPreviousMutation.styles.height + dy}px`

    // adjust handles
    cache.handleElements.br.style.left = `${handlePositions.br.left + dx}px`
    cache.handleElements.br.style.top = `${handlePositions.br.top + dy}px`
    cache.handleElements.bl.style.top = `${handlePositions.bl.top + dy}px`
    cache.handleElements.tr.style.left = `${handlePositions.br.left + dx}px`
  }

  if (cache.activeHandlePosition === 'bl') {
    // adjust shape
    cache.activeElement.style.width = `${cache.activeElementPreviousMutation.styles.width - dx}px`
    cache.activeElement.style.left = `${cache.activeElementPreviousMutation.styles.left + dx}px`
    cache.activeElement.style.height = `${cache.activeElementPreviousMutation.styles.height + dy}px`

    // adjust handles
    cache.handleElements.bl.style.top = `${handlePositions.bl.top + dy}px`
    cache.handleElements.bl.style.left = `${handlePositions.bl.left + dx}px`
    cache.handleElements.tl.style.left = `${handlePositions.tl.left + dx}px`
    cache.handleElements.br.style.top = `${handlePositions.br.top + dy}px`
  }

  if (cache.activeHandlePosition === 'tr') {
    // adjust shape
    cache.activeElement.style.width = `${cache.activeElementPreviousMutation.styles.width + dx}px`
    cache.activeElement.style.height = `${cache.activeElementPreviousMutation.styles.height - dy}px`
    cache.activeElement.style.top = `${cache.activeElementPreviousMutation.styles.top + dy}px`

    // adjust handles
    cache.handleElements.tr.style.top = `${handlePositions.tr.top + dy}px`
    cache.handleElements.tr.style.left = `${handlePositions.tr.left + dx}px`
    cache.handleElements.tl.style.top = `${handlePositions.tl.top + dy}px`
    cache.handleElements.br.style.left = `${handlePositions.br.left + dx}px`
  }

  if (cache.activeHandlePosition === 'tl') {
    // adjust shape
    cache.activeElement.style.width = `${cache.activeElementPreviousMutation.styles.width - dx}px`
    cache.activeElement.style.height = `${cache.activeElementPreviousMutation.styles.height - dy}px`
    cache.activeElement.style.top = `${cache.activeElementPreviousMutation.styles.top + dy}px`
    cache.activeElement.style.left = `${cache.activeElementPreviousMutation.styles.left + dx}px`

    // adjust handles
    cache.handleElements.tr.style.top = `${handlePositions.tr.top + dy}px`
    cache.handleElements.tl.style.top = `${handlePositions.tl.top + dy}px`
    cache.handleElements.tl.style.left = `${handlePositions.tl.left + dx}px`
    cache.handleElements.bl.style.left = `${handlePositions.bl.left + dx}px`
  }
}

interface Layer {
  element: HTMLElement
  mutation: Mutation
  handles: HTMLElement[]
}

export function prepareInitialState(mutations: Mutation[]): Layer[] {
  globalState.mutations = mutations
  const state = getState(mutations)

  return state.map(mut => {
    const handles = Object.values(deriveHandles(mut, size)).map(handle => {
      const { left, top } = handle
      const $handle = h('div', { 
        styles: { left, top, width: size, height: size, background: handleColor, zIndex: 100 }
      }, {
        handle: `el-${mut.id}-${handle.pos}`
      })
      $handle.addEventListener('mousedown', (e: MouseEvent) => handleOnMouseDown(e, mut.id, handle.pos))
      return $handle
    })

    const element = h('div', { styles: mut.styles }, { el: mut.id })
    element.addEventListener('mousedown', (e: MouseEvent) => elementOnMouseDown(e, mut.id))

    return {
      element,
      mutation: mut,
      handles
    }
  })
}
