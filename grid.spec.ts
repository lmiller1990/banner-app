import { GridState, GridOptions, grid, normalizeCursorPos } from './grid'

test('grid', () => {
  const state: GridState = {
    coordinates: {
      height: {
        units: 10,
        px: 100
      },
      width: {
        units: 10,
        px: 100
      },
    },
    element: {
      pos: {
        top: 1,
        left: 1,
        width: 5,
        height: 5,
      }
    }
  }

  const input: GridOptions = {
    cursor: {
      x: 60,
      y: 60
    },
    handle: 'bottom-right'
  }

  const expectedState: GridState = {
    ...state,
    element: {
      pos: {
        ...state.element.pos,
        width: 6,
        height: 6
      }
    }
  }

  const updatedState = grid(state, input)

  expect(updatedState).toEqual(expectedState)
})

test('normalizeCursorPos', () => {
  const actual = normalizeCursorPos({
    x: 60,
    y: 60,
  }, {
    width: {
      px: 100,
      units: 10,
    },
    height: {
      px: 100,
      units: 10,
    }
  })

  expect(actual).toEqual({
    x: 6,
    y: 6
  })
})