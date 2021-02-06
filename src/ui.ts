import { createGlobalState, deriveHandles, getState, HandlePosition, keys, Mutation, WorldState } from "./core"

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

const h = (type: string, props: Props = {}, dataset: Record<string, string> = {}) => {
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
  return el
}

const resetGlobalState = () => {
  for (const k of Object.keys(globalState)) {
    globalState[k as keyof WorldState<DraggingCache>] = undefined
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

type ActionCache = DraggingCache

export const globalState = createGlobalState<ActionCache>()

export const getPosRelativeToEl = (e: MouseEvent, el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const cursorX = e.clientX - rect.left
  const cursorY = e.clientY - rect.top
  return { cursorX, cursorY }
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

export const elementOnMouseDown = (e: MouseEvent, elementId: string) => {
  globalState.activeElementId = elementId
  globalState.action = 'dragging'
}

export const appOnMouseMove = (e: MouseEvent, mutations: Mutation[]) => {
  if (globalState.action === 'dragging') {
    if (!globalState.actionCache) {
      const cache: DraggingCache = {
        app: $('[data-el="app"]'),
        handleElements: {
          tr: $(`[data-handle="el-${globalState.activeElementId}-tr"]`),
          tl: $(`[data-handle="el-${globalState.activeElementId}-tl"]`),
          br: $(`[data-handle="el-${globalState.activeElementId}-br"]`),
          bl: $(`[data-handle="el-${globalState.activeElementId}-bl"]`),
        },
        activeElement: $(`[data-el="${globalState.activeElementId}"]`),
        activeElementPreviousMutation: mutations.reverse().find(x => x.id === globalState.activeElementId)!
      }
      globalState.actionCache = cache
    }

    drag(e, must(globalState, 'actionCache'))
  }
}

export const documentOnMouseUp = (e: MouseEvent, updateHistory: (mutation: Mutation) => void) => {
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

    updateHistory(mutation)
  }


  resetGlobalState()
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


interface Layer {
  element: HTMLElement
  mutation: Mutation
  handles: HTMLElement[]
}

export function prepareInitialState(mutations: Mutation[]): Layer[] {
  const state = getState(mutations)
  return state.map(mut => {
    const handles = Object.values(deriveHandles(mut, size)).map(handle => {
      const { left, top } = handle
      return h('div', { 
        styles: { left, top, width: size, height: size, background: handleColor, zIndex: 100 }
      }, {
        handle: `el-${mut.id}-${handle.pos}`
      })
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
