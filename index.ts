import { 
  addHistoryEntry, 
  addHistoryEntryInvalidateFuture,
  Move,
  Resize,
  Action,
  Styles,
  Create,
  createShape,
  AllProps
} from './core'

function $<T extends HTMLElement>(q: string) {
  return document.querySelector<T>(q)
}

function $$<T extends HTMLDivElement>(q: string) {
  return Array.from(document.querySelectorAll<T>(q))
}

const $app = $<HTMLDivElement>('#app')!
const scale = 0.5
const width = 1280 * scale
const height = 720 * scale
$app.style.height = `${height}px`
$app.style.width = `${width}px`

const getPos = (e: MouseEvent) => {
  const rect = $app.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return { x, y }
}

function getPosRelToApp($el: HTMLElement) {
  const appRect = $app.getBoundingClientRect()
  const elRect = $el.getBoundingClientRect()
  return {
    top: elRect.top - appRect.top,
    left: elRect.left - appRect.left,
    width: elRect.width,
    height: elRect.height,
  }
}

interface CreateElementOptions {
  x: number
  y: number
}

/** 
 * options
 * x - x pos to create in px
 * y - y pos to create in px
 */
const createElement = (options: CreateElementOptions) => {
  const $el = document.createElement('div')
  $el.className = 'el'
  $el.style.top = `${options.y}px`
  $el.style.left = `${options.x}px`
  return $el
}

$app.addEventListener('click', (e) => {
  if (e.target !== $app) {
    return
  }

  const { x, y } = getPos(e)
  const $el = createElement({ x, y })
  $app.appendChild($el)
})

// function createEl(layer: Layer) {
//   const $el = document.createElement(layer.type)
//   $el.id = layer.id
//   $el.style.top = layer.rect.top + 'px'
//   $el.style.left = layer.rect.left + 'px'
//   $el.style.width = layer.rect.width + 'px'
//   $el.style.height = layer.rect.height + 'px'
//   $el.style.background = layer.styles.background || ''
//   $el.style.position = 'absolute'
//   $el.textContent = layer.text || ''
//   return $el
// }

let resizing = false
let dragging = false
const $resizing = $<HTMLDivElement>('#resizing-val')!

function setResizing(val: boolean) {
  resizing = val
  $resizing.innerText = val.toString()
}

function setDragging(val: boolean) {
  dragging = val
}

type HandlePosition = 'tr' | 'tl' | 'br' | 'bl'

export interface Rect {
  top: number
  left: number 
  width: number 
  height: number
}

interface HandleCoordinates {
  tr: {
    top: number
    left: number
  }
  tl: {
    top: number
    left: number
  }
  br: {
    top: number
    left: number
  }
  bl: {
    top: number
    left: number
  }
}

let clickX: number
let clickY: number
let handlePos: HandlePosition
let originalHandlePos: HandleCoordinates
let dx: number = 0
let dy: number = 0
let originalRect: Rect
let selectedId: string | undefined

const getSelectedElement = (id?: string) => {
  if (!id) {
    throw Error('No selected id')
  }

  return $('#' + selectedId)!
}

const $cursor = $<HTMLDivElement>('#cursor-val')!
const $handlePos = $<HTMLDivElement>('#handle-pos-val')!
const $selectedId = $<HTMLDivElement>('#id-val')!
const $addRandomShape = $<HTMLButtonElement>('#add-shape')!
const $layers = $<HTMLDivElement>('#layers')!

$addRandomShape.addEventListener('click', () => {
  const randomTop = () => parseInt((Math.random() * 300).toFixed())
  const randomLeft = () => parseInt((Math.random() * 550).toFixed())
  const action: Create = {
    type: 'create',
    id: randomId(),
    element: 'div',
    props: {
      top: randomTop(),
      left: randomLeft(),
      height: 100,
      width: 200,
      styles: {
        background: 'blue'
      }
    }
  }
  render([action])
})

// function drawToolbar(shape: ) {
// }

function hideAllHandles() {
  $$('[data-type="handle"]').forEach($h => $h.style.visibility = 'hidden')
}

function setSelectedId(id: string | undefined) {
  if (!id) {
    $selectedId.textContent = ''
    hideAllHandles()
    return selectedId = undefined
  }

  selectedId = id
  $selectedId.innerHTML = selectedId
  hideAllHandles()
  const handles = $$(`[data-el="${selectedId}"]`)
  handles.forEach($h => {
    $h.style.visibility = 'visible'
  })
  drawToolbar(id, history)
}

function drawToolbar(id: string, history: Action[]) {
  const mostRecentState = history.reverse().find(x => x.id === id)
  if (!mostRecentState) {
    throw Error('wtf')
  }

  const createInput = (attr: string, value: string) => {
    const $label = document.createElement('label')
    $label.textContent = attr
    const $input = document.createElement('input')
    $input.type = 'text'
    $input.value = value
    const $wrapper = document.createElement('div')
    $wrapper.appendChild($label)
    $wrapper.appendChild($input)
    return $wrapper
  }

  for (const style of mostRecentState.) {

  }

  console.log(history)  
}

function startResize(e: MouseEvent, $h: HTMLDivElement, pos: HandlePosition, $el: HTMLDivElement) {
  setResizing(true)
  const { x, y } = getPos(e)
  clickX = x 
  clickY = y
  originalRect = getPosRelToApp($el)
  setSelectedId($el.id)
  const handleRect = getPosRelToApp($h)
  originalHandlePos = calcHandPos($el)
  handlePos = pos
  $cursor.innerText = `x: ${x} y: ${y}`
  $handlePos.innerText = `x: ${handleRect.left} y: ${handleRect.top}`
}

$app.addEventListener('mouseup', e => {
  if (e.target === $base) {
    return setSelectedId(undefined)
  }

  if (!selectedId) {
    return
  }

  const currentBoundingRect = getSelectedElement(selectedId).getBoundingClientRect()
  const hasResized = (dx !== 0 || dy !== 0 || currentBoundingRect.width !== originalRect.width || currentBoundingRect.height !== originalRect.height)

  if (resizing && hasResized) {
    const action: Resize = {
      type: 'resize',
      id: selectedId,
      props: {
        top: originalRect.top + dy,
        left: originalRect.left + dx,
        width: currentBoundingRect.width,
        height: currentBoundingRect.height
      }
    }
    history = addHistoryEntry({ history, action })
  }

  const hasMoved = (dx !== 0 || dy !== 0)
  if (dragging && hasMoved) {
    const action: Move = {
      type: 'move',
      id: selectedId,
      props: {
        top: originalRect.top + dy,
        left: originalRect.left + dx,
      }
    }
    history = addHistoryEntry({ history, action })
  }

  setDragging(false)
  setResizing(false)
  dx = 0
  dy = 0
})

function handleDragging(e: MouseEvent) {
  const $el = getSelectedElement(selectedId)
  const { x, y } = getPos(e)
  dx = x - clickX
  dy = y - clickY
  console.log(dx,dy)
  $el.style.left = `${originalRect.left + dx}px`
  $el.style.top = `${originalRect.top + dy}px`
  const handles = $$(`[data-el="${selectedId}"]`)
  handles.forEach($h => {
    if ($h.id.includes('bl')) {
      $h.style.left = `${originalHandlePos.bl.left + dx}px`
      $h.style.top = `${originalHandlePos.bl.top + dy}px`
    }

    if ($h.id.includes('br')) {
      $h.style.left = `${originalHandlePos.br.left + dx}px`
      $h.style.top = `${originalHandlePos.br.top + dy}px`
    }

    if ($h.id.includes('tl')) {
      $h.style.left = `${originalHandlePos.tl.left + dx}px`
      $h.style.top = `${originalHandlePos.tl.top + dy}px`
    }

    if ($h.id.includes('tr')) {
      $h.style.left = `${originalHandlePos.tr.left + dx}px`
      $h.style.top = `${originalHandlePos.tr.top + dy}px`
    }
  })
}

function handleResize(e: MouseEvent) {
  let { x, y } = getPos(e)
  dx = x - clickX
  dy = y - clickY
  const $el = $(`#${selectedId}`)!

  if (handlePos === 'br') {
    const $br = $(`#${$el.id}-h-br`)!
    const $bl = $(`#${$el.id}-h-bl`)!
    const $tr = $(`#${$el.id}-h-tr`)!

    $el.style.width = `${originalRect.width + dx}px`
    $el.style.height = `${originalRect.height + dy}px`

    $br.style.top = `${originalHandlePos.br.top + dy}px`
    $br.style.left = `${originalHandlePos.br.left + dx}px`
    $bl.style.top = `${originalHandlePos.bl.top + dy}px`
    $tr.style.left = `${originalHandlePos.tr.left + dx}px`
  }

  if (handlePos === 'bl') {
    $el.style.width = `${originalRect.width - dx}px`
    $el.style.left = `${originalRect.left + dx}px`
    $el.style.height = `${originalRect.height + dy}px`

    const $br = $(`#${$el.id}-h-br`)!
    const $bl = $(`#${$el.id}-h-bl`)!
    const $tl = $(`#${$el.id}-h-tl`)!

    $bl.style.top = `${originalHandlePos.bl.top + dy}px`
    $bl.style.left = `${originalHandlePos.bl.left + dx}px`
    $tl.style.left = `${originalHandlePos.tl.left + dx}px`
    $br.style.top = `${originalHandlePos.br.top + dy}px`
  }

  if (handlePos === 'tr') {
    $el.style.width = `${originalRect.width + dx}px`
    $el.style.height = `${originalRect.height - dy}px`
    $el.style.top = `${originalRect.top + dy}px`

    const $br = $(`#${$el.id}-h-br`)!
    const $tl = $(`#${$el.id}-h-tl`)!
    const $tr = $(`#${$el.id}-h-tr`)!

    $tr.style.top = `${originalHandlePos.tr.top + dy}px`
    $tr.style.left = `${originalHandlePos.tr.left + dx}px`
    $tl.style.top = `${originalHandlePos.tl.top + dy}px`
    $br.style.left = `${originalHandlePos.br.left + dx}px`
  }

  if (handlePos === 'tl') {
    $el.style.width = `${originalRect.width - dx}px`
    $el.style.height = `${originalRect.height - dy}px`
    $el.style.top = `${originalRect.top + dy}px`
    $el.style.left = `${originalRect.left + dx}px`

    const $bl = $(`#${$el.id}-h-bl`)!
    const $tl = $(`#${$el.id}-h-tl`)!
    const $tr = $(`#${$el.id}-h-tr`)!

    $tr.style.top = `${originalHandlePos.tr.top + dy}px`
    $tl.style.top = `${originalHandlePos.tl.top + dy}px`
    $tl.style.left = `${originalHandlePos.tl.left + dx}px`
    $bl.style.left = `${originalHandlePos.bl.left + dx}px`
  }
}

$app.addEventListener('mousemove', (e: MouseEvent) => {
  if (dragging) {
    return handleDragging(e)
  }


  if (resizing) {
    return handleResize(e)
  }
})

function layerRect($el: HTMLDivElement) {
  const appRect = $app.getBoundingClientRect()
  const elRect = $el.getBoundingClientRect()

  return {
    width: elRect.width,
    height: elRect.height,
    top: elRect.top - appRect.top,
    left: elRect.left - appRect.left,
  }
}

const sz = 10

interface CreateHandleOptions {
  $el: HTMLDivElement
  top: number
  left: number
  id: string
  pos: HandlePosition
}

function createHandle(options: CreateHandleOptions) {
  const $handle = document.createElement('div')
  $handle.style.background = 'white'
  $handle.style.position = 'absolute'
  $handle.style.left = `${options.left}px`
  $handle.style.top = `${options.top}px`
  $handle.id = `${options.$el.id}-${options.id}`
  $handle.dataset.el = options.$el.id
  $handle.dataset.type = 'handle'
  $handle.style.visibility = 'hidden'
  $handle.className = 'cursor-pointer'
  $handle.style.height = `${sz}px`
  $handle.style.width =  `${sz}px`
  $handle.addEventListener('mousedown', e => startResize(e, $handle, options.pos, options.$el))
  return $handle
}

export interface Layer {
  id: string
  type: 'div' | 'p'
  rect: Rect
  text?: string
  styles: Styles
}

function randomId() {
  return (Math.random() * 10000).toFixed()
}

const initial: Create = {
  type: 'create',
  id: randomId(),
  element: 'div',
  props: {
    top: 50,
    left: 50,
    height: 100,
    width: 200,
    styles: {
      background: 'red'
    }
  }
}

let history: Action[] = [
  initial
]

function calcHandPos($el: HTMLDivElement) {
  const rect = layerRect($el)

  return {
    tl: {
      top: rect.top - (sz / 2),
      left: rect.left - (sz / 2),
    },
    tr: {
      top: rect.top - (sz / 2),
      left: rect.left + rect.width - (sz / 2),
    },
    br: {
      top: rect.top + rect.height - (sz / 2),
      left: rect.left + rect.width - (sz / 2),
    },
    bl: {
      top: rect.top + rect.height - (sz / 2),
      left: rect.left - (sz / 2),
    },
  }
}

let $base: HTMLDivElement

function drawBase() {
  $base = document.createElement('div')
  $base.dataset.type = 'base'
  $base.style.position = 'absolute'
  $base.style.height = height + 'px'
  $base.style.width = width + 'px'
  $base.style.top = '0px'
  $base.style.left = '0px'
  $base.style.background = 'blue'
  $app.appendChild($base)
}

function onElementMouseDown(e: MouseEvent, $el: HTMLDivElement) {
  originalHandlePos = calcHandPos($el)
  originalRect = getPosRelToApp($el)
  setDragging(true)
  setSelectedId($el.id)
  const { x, y } = getPos(e)
  clickX = x 
  clickY = y
}

function render(state: Action[]) {
  for (const layer of state) {
    const $el = createShape({
      top: layer.props.top,
      left: layer.props.left,
      width: 100,
      height: 100,
      styles: {
        background: 'red'
      }
    })
    $el.addEventListener('mousedown', e => onElementMouseDown(e, $el))

    $app.appendChild($el)

    const $layerControl = document.createElement('button')
    $layerControl.textContent = `Layer ${$el.id}`
    $layerControl.addEventListener('click', () => {
      setSelectedId($el.id)
    })
    $layers.appendChild($layerControl)

    const { br, bl, tr, tl } = calcHandPos($el)
    const $br = createHandle({
      $el,
      id: 'h-br',
      pos: 'br',
      top: br.top,
      left: br.left,
    })
    $app.appendChild($br)

    const $bl = createHandle({
      $el,
      id: 'h-bl',
      pos: 'bl',
      top: bl.top,
      left: bl.left,
    })
    $app.appendChild($bl)

    const $tr = createHandle({
      $el,
      id: 'h-tr',
      pos: 'tr',
      top: tr.top,
      left: tr.left,
    })

    $app.appendChild($tr)
    const $tl = createHandle({
      $el,
      id: 'h-tl',
      pos: 'tl',
      top: tl.top,
      left: tl.left,
    })
    $app.appendChild($tl)

  }
}

drawBase()
render(history)
