export interface Rect {
  top: number
  left: number 
  width: number 
  height: number
}

export const supportedRules = ['background', 'color', 'width', 'height', 'top', 'left', 'borderRadius'] as const

export type HandlePosition = 'tr' | 'tl' | 'br' | 'bl'

export interface WorldState<ActionCache> {
  activeElementId?: string
  clickX?: number
  clickY?: number
  actionCache?: ActionCache
  action?: 'dragging' | 'resizing'
  mutations: Mutation[]
}

export const createGlobalState = <T>() => {
  return new Proxy<WorldState<T>>({
    activeElementId: undefined,
    clickX: undefined,
    clickY: undefined,
    action: undefined,
    actionCache: undefined,
    mutations: []
  }, {
    set: (obj: WorldState<T>, prop: keyof WorldState<T>, val: string | number | undefined) => {
      const out = typeof val === 'object' ? JSON.stringify(val) : val
      console.log(`Setting ${prop}: ${out}`)
      return Reflect.set(obj, prop, val)
    }
  })
}

export interface Mutation {
  id: string
  text: string
  styles: {
    zIndex: number
    top: number
    left: number
    width: number
    height: number
    background: string
    color: string
  }
}

export const addMutation = (history: Mutation[], mutation: Mutation): Mutation[] => {
  return [...history, mutation]
}

export const getState = (history: Mutation[]): Mutation[] => {
  const red = history.reverse().reduce<{ mutations: Mutation[], found: Record<string, true> }>((acc, curr) => {
    if (!acc.found[curr.id]) {
      return {
        mutations: [...acc.mutations, curr],
        found: { ...acc.found, [curr.id]: true }
      }
    }
    return acc
  }, { found: {}, mutations: [] })

  return red.mutations
}

// export const keys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[]
export function keys<T>(o: T) {
  return Object.keys(o) as Extract<keyof T, string>[]
}


interface HandleData {
  pos: HandlePosition
  top: number
  left: number
}

interface DeriveHandles {
  tl: HandleData
  tr: HandleData
  br: HandleData
  bl: HandleData
}

export const deriveHandles = (mutation: Mutation, size: number): DeriveHandles => {
  const { top, left, width, height } = mutation.styles

  return {
    tl: {
      pos: 'tl',
      top: top - (size / 2),
      left: left - (size / 2),
    },
    tr: {
      pos: 'tr',
      top: top - (size / 2),
      left: left + width - (size / 2),
    },
    br: {
      pos: 'br',
      top: top + height - (size / 2),
      left: left + width - (size / 2),
    },
    bl: {
      pos: 'bl',
      top: top + height - (size / 2),
      left: left - (size / 2),
    },
  }
}
