import { getState, Mutation } from "../core"

const baseMut: Mutation = {
  id: '1',
  text: '',
  styles: {
    zIndex: 0,
    top: 100,
    left: 100,
    width: 50,
    height: 50,
    background: 'red',
    color: 'white'
  }
}

test('getState', () => {
  const oldMut = { ...baseMut, id: '1' }
  const newMut = { ...baseMut, id: '1' }
  const anotherMut = { ...baseMut, id: '2' }
  const mutations: Mutation[] = [
    oldMut,
    newMut,
    anotherMut
  ]
  expect(getState(mutations)).toEqual([anotherMut, newMut])
})