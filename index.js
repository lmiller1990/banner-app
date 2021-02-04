const $ = q => document.querySelector(q)
const $$ = q => document.querySelectorAll(q)

const getPos = (e) => {
  const rect = $app.getBoundingClientRect()
  const x = e.clientX - rect.left // x pos
  const y = e.clientY - rect.top  // y pos
  return { x, y }
}

function getPosRelToApp($el) {
  const appRect = $app.getBoundingClientRect()
  const elRect = $el.getBoundingClientRect()
  return {
    top: elRect.top - appRect.top,
    left: elRect.left - appRect.left,
    width: elRect.width,
    height: elRect.height,
  }
}

const scale = 0.5
const width = 1280 * scale
const height = 720 * scale
const $app = $('#app')
$app.style.height = `${height}px`
$app.style.width = `${width}px`

const selectElement = ($el) => {
  const $els = $$('.el')
  Array.from($els).forEach($el => $el.classList.remove('el--selected'))
  $el.classList.add('el--selected')
}

/** 
 * options
 * x - x pos to create in px
 * y - y pos to create in px
 */
const createElement = (options) => {
  const $el = document.createElement('div')
  $el.className = 'el'
  $el.style.top = `${options.y}px`
  $el.style.left = `${options.x}px`
  $el.addEventListener('click', () => selectElement($el))

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


// $save.addEventListener('click', async () => {
//   const img = await html2image.toPng($('#app'))
//   download(img, './image.png')
// })


function createEl(layer) {
  const $el = document.createElement(layer.el.type)
  $el.id = layer.el.id
  $el.style.top = layer.el.top + 'px'
  $el.style.left = layer.el.left + 'px'
  $el.style.width = layer.el.width + 'px'
  $el.style.height = layer.el.height + 'px'
  $el.style.background = 'red'
  $el.style.position = 'absolute'
  // $el.addEventListener('click', e => elClick(e, $el))
  return $el
}

let dragging = false
const $drag = $('#dragging-val')

function setDragging(val) {
  dragging = val
  $drag.innerText = val
}

function stopDrag(e, $h) {
  setDragging(false)
}

let clickX
let clickY
let originalW
let originalL
let originalH
let handlePos
let handles
let originalHandlePos
let originalRect

let id
const $cursor = $('#cursor-val')
const $handlePos = $('#handle-pos-val')
const $id = $('#id-val')

function mousedown(e, $h, pos, $el) {
  setDragging(true)
  const { x, y } = getPos(e)
  clickX = x 
  clickY = y
  id = $el.id
  const handleRect = getPosRelToApp($h)
  originalRect = getPosRelToApp($el)
  originalHandlePos = calcHandPos($el)
  handlePos = pos
  $cursor.innerText = `x: ${x} y: ${y}`
  $handlePos.innerText = `x: ${handleRect.left} y: ${handleRect.top}`
  $id.innerText = $el.id
  const sel = `[data-el="${$el.id}"]`
  handles = Array.from($$(sel))
}

$app.addEventListener('mouseup', e => {
  stopDrag(e)
})

$app.addEventListener('mousemove', e => {
  if (!dragging) {
    return
  }

  const { x, y } = getPos(e)
  const dx = x - clickX
  const dy = y - clickY
  const $el = $(`#${id}`)

  if (handlePos === 'br') {
    const $br = $(`#${$el.id}-h-br`)
    const $bl = $(`#${$el.id}-h-bl`)
    const $tr = $(`#${$el.id}-h-tr`)

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

    const $br = $(`#${$el.id}-h-br`)
    const $bl = $(`#${$el.id}-h-bl`)
    const $tl = $(`#${$el.id}-h-tl`)

    $bl.style.top = `${originalHandlePos.bl.top + dy}px`
    $bl.style.left = `${originalHandlePos.bl.left + dx}px`
    $tl.style.left = `${originalHandlePos.tl.left + dx}px`
    $br.style.top = `${originalHandlePos.br.top + dy}px`
  }

  if (handlePos === 'tr') {
    $el.style.width = `${originalRect.width + dx}px`
    $el.style.height = `${originalRect.height - dy}px`
    $el.style.top = `${originalRect.top + dy}px`

    const $br = $(`#${$el.id}-h-br`)
    const $tl = $(`#${$el.id}-h-tl`)
    const $tr = $(`#${$el.id}-h-tr`)

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

    const $bl = $(`#${$el.id}-h-bl`)
    const $tl = $(`#${$el.id}-h-tl`)
    const $tr = $(`#${$el.id}-h-tr`)

    $tr.style.top = `${originalHandlePos.tr.top + dy}px`
    $tl.style.top = `${originalHandlePos.tl.top + dy}px`
    $tl.style.left = `${originalHandlePos.tl.left + dx}px`
    $bl.style.left = `${originalHandlePos.bl.left + dx}px`
  }
})

function layerRect($el) {
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

/** 
 * options
 * top
 * left
 * id
 * pos: bl br tl tr
 */
function createHandle(options) {
  const $handle = document.createElement('div')
  $handle.style.background = 'white'
  $handle.style.position = 'absolute'
  $handle.style.left = `${options.left}px`
  $handle.style.top = `${options.top}px`
  $handle.id = `${options.$el.id}-${options.id}`
  $handle.dataset.el = options.$el.id
  $handle.className = 'cursor-pointer'
  $handle.style.height = `${sz}px`
  $handle.style.width =  `${sz}px`
  $handle.addEventListener('mousedown', e => mousedown(e, $handle, options.pos, options.$el))
  return $handle
}

let layers = [
  {
    el: {
      id: `el-${(Math.random() * 1000).toFixed()}`,
      type: 'div',
      top: 50,
      left: 50,
      height: 100,
      width: 200
    }
  }
]

function calcHandPos($el) {
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

function drawBase() {
  const $layer = document.createElement('div')
  $layer.style.position = 'absolute'
  $layer.style.height = height + 'px'
  $layer.style.width = width + 'px'
  $layer.style.top = '0px'
  $layer.style.left = '0px'
  $layer.style.background = 'blue'
  $app.appendChild($layer)
}

function render(layers) {
  for (const layer of layers) {
    const $el = createEl(layer)
    $app.appendChild($el)

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
render(layers)

