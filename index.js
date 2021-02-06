const $ = q => document.querySelector(q)
const $$ = q => document.querySelectorAll(q)

const getPos = (e) => {
  const rect = $app.getBoundingClientRect()
  const x = e.clientX - rect.left // x pos
  const y = e.clientY - rect.top  // y pos
  return { x, y }
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

  console.log('here')
  const { x, y } = getPos(e)
  const $el = createElement({ x, y })
  $app.appendChild($el)
})


// $save.addEventListener('click', async () => {
//   const img = await html2image.toPng($('#app'))
//   download(img, './image.png')
// })

const layers = [
  {
    el: {
      type: 'div',
      top: 50,
      left: 50,
      height: 100,
      width: 200
    }
  }
]

function render(layers) {
  for (const layer of layers) {
    const $el = document.createElement(layer.el.type)
    $el.style.top = layer.el.top + 'px'
    $el.style.left = layer.el.left + 'px'
    $el.style.width = layer.el.width + 'px'
    $el.style.height = layer.el.height + 'px'
    $el.style.background = 'red'
    $el.style.position = 'absolute'
    const $layer = document.createElement('div')
    $layer.style.position = 'absolute'
    $layer.style.height = height + 'px'
    $layer.style.width = width + 'px'
    $layer.style.top = '0px'
    $layer.style.left = '0px'
    $layer.style.background = 'blue'
    $layer.appendChild($el)
    $app.appendChild($layer)
  }
}

render(layers)