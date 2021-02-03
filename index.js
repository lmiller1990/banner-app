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
let originalH
let originalHandleTop
let originalHandleLeft

let id
const $cursor = $('#cursor-val')
const $id = $('#id-val')

function mousedown(e, $h, $el) {
  setDragging(true)
  const { x, y } = getPos(e)
  clickX = x 
  clickY = y
  id = $el.id
  const { width, height } = $el.getBoundingClientRect()
  const handleRect = getPosRelToApp($h)
  originalW = width
  originalH = height
  originalHandleTop = handleRect.top
  originalHandleLeft = handleRect.left
  $cursor.innerText = `x: ${x} y: ${y}`
  $id.innerText = $el.id
}

$app.addEventListener('mouseup', e => stopDrag(e))

$app.addEventListener('mousemove', e => {
  if (!dragging) {
    return
  }

  const { x, y } = getPos(e)
  const dx = x - clickX
  const dy = y - clickY
  const $el = $(`#${id}`)
  const $h = $(`#${id}-h-br`)
  $el.style.width = `${originalW + dx}px`
  $el.style.height = `${originalH + dy}px`
  $h.style.top = `${originalHandleTop + dy}px`
  $h.style.left = `${originalHandleLeft + dx}px`
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

function createHandle() {
  const $handle = document.createElement('div')
  $handle.style.background = 'white'
  $handle.style.position = 'absolute'
  $handle.className = 'cursor-pointer'
  $handle.style.height = `${sz}px`
  $handle.style.width =  `${sz}px`
  return $handle
}

function elClick(e, $el) {

  // top left
  let $h = createHandle()
  $h.id = $el.id + `-h-tl`
  $h.style.top = rect.top - (sz/2) + 'px'
  $h.style.left = rect.left - (sz/2) + 'px'
  $h.addEventListener('mousedown', e => mousedown(e, $h, $el))
  // $app.appendChild($h)

  // top right
  $h = createHandle()
  $h.style.top = rect.top - (sz/2) + 'px'
  $h.style.left = rect.left + rect.width - (sz/2) + 'px'
  $h.addEventListener('mousedown', e => mousedown(e, $h, $el))
  // $app.appendChild($h)

  const rect = layerRect($el)
  // bottom right
  $h = createHandle()
  $h.style.top = rect.top + rect.height - (sz/2) + 'px'
  $h.style.left = rect.left + rect.width - (sz/2) + 'px'
  $h.id = $el.id + `-h-br`
  $app.appendChild($h)
  $h.addEventListener('mousedown', e => mousedown(e, $h, $el))

  // bottom left
  $h = createHandle()
  $h.style.top = rect.top + rect.height - (sz/2) + 'px'
  $h.style.left = rect.left - (sz/2) + 'px'
  $h.addEventListener('mousedown', e => mousedown(e, $h, $el))
  // $app.appendChild($h)
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


    const rect = layerRect($el)
    // bottom right
    const $h = createHandle()

    $h.style.top = rect.top + rect.height - (sz/2) + 'px'
    $h.style.left = rect.left + rect.width - (sz/2) + 'px'
    $h.id = $el.id + `-h-br`
    $app.appendChild($h)
    $h.addEventListener('mousedown', e => mousedown(e, $h, $el))
  }
}

drawBase()
render(layers)

