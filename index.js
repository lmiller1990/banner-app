import * as html2image from 'html-to-image'
import download from 'downloadjs'


const $ = q => document.querySelector(q)
const $$ = q => document.querySelectorAll(q)

const getPos = (e) => {
  const rect = $app.getBoundingClientRect()
  const x = e.clientX - rect.left // x pos
  const y = e.clientY - rect.top  // y pos
  return { x, y }
}

const $app = $('#app')

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
const createElement = (options) =>  {
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


const $save = $('#save')
$save.addEventListener('click', async () => {
  const img = await html2image.toPng($('#app'))
  download(img, './image.png')
})