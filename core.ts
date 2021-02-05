export type SupportedCSSRule = 'background' | 'color'
export type Styles = Partial<Record<SupportedCSSRule, string>>

export interface Resize {
  type: 'resize'
  id: string
  props: {
    top: number
    left: number
    width: number
    height: number
  }
}

export interface Move {
  type: 'move'
  id: string
  props: {
    top: number
    left: number
  }
}

export interface CreateShapeProps {
  top: number
  left: number
  width: number
  height: number
  styles: Styles
}

export interface CreateTextProps {
  top: number
  left: number
  text: string
  styles: Styles
}

export interface Create {
  type: 'create'
  element: 'div' | 'p'
  id: string
  props: CreateShapeProps | CreateTextProps
}

export type Action = Resize | Move | Create

interface AddHistoryOptions {
  history: Action[]
  action: Action
}

export const random = () => `el-${(Math.random() * 1000000).toFixed()}`

export function createShape(options: CreateShapeProps): HTMLDivElement {
  const el = document.createElement('div')
  el.id = random()
  el.style.top = `${options.top}px`
  el.style.left = `${options.left}px`
  el.style.width = `${options.width}px`
  el.style.height = `${options.height}px`
  el.style.position = 'absolute'

  Object.entries(options.styles).forEach(([attr, val]) => {
    el.style[attr as SupportedCSSRule] = val ?? ''
  })

  return el
}

export const addHistoryEntry = ({ history, action } : AddHistoryOptions): Action[] => {
  const newHistory = [...history, action]
  console.log(newHistory)
  return newHistory
}

interface AddInvalidateHistoryOptions extends AddHistoryOptions {
  invalidateFrom: number
}

export const addHistoryEntryInvalidateFuture = ({
  history,
  action,
  invalidateFrom
}: AddInvalidateHistoryOptions): Action[] => {
  const forked = history.splice(invalidateFrom, -1)
  return [...forked, action]
}