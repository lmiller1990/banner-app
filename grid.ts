interface Measurement {
    px: number
    units: number
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export interface Coordinates {
  width: Measurement
  height: Measurement
}

export interface GridState {
  coordinates: Coordinates
  element: {
    pos: Rect
  }
}

export type Handle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface Cursor {
  x: number
  y: number
}

export interface GridOptions {
  cursor: Cursor
  handle: Handle
}

export const normalizeCursorPos = (
  cursor: Cursor, 
  coordinates: Coordinates
): Cursor => {
  return {
    x: (cursor.x / coordinates.width.px) * coordinates.width.units,
    y: (cursor.y / coordinates.height.px) * coordinates.height.units
  }
}

export const unitToPx = (unit: number, coordinates: Coordinates, type: 'height' | 'width') => {
  if (type === 'height') {
    return unit * coordinates.height.px
  }

  if (type === 'width') {
    return unit * coordinates.width.px
  }
}

export const grid = (gs: GridState, options: GridOptions): GridState => {
  if (options.handle === 'bottom-right') {
    const c = normalizeCursorPos(options.cursor, gs.coordinates)
    const right = gs.element.pos.left + gs.element.pos.width - 1
    const bottom = gs.element.pos.top + gs.element.pos.height - 1

    return {
      ...gs,
      element: {
        ...gs.element,
        pos: {
          ...gs.element.pos,
          width: right + (c.x - gs.element.pos.width),
          height: bottom + (c.y - gs.element.pos.height)
        }
      }
    }
  }

  return {
    ...gs,
  }
}