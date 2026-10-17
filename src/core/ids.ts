import type { GameState } from './types'

/** The next entity id with the given prefix, taken from the Game State's id counter. */
export function nextId(state: Pick<GameState, 'idCounter'>, prefix: string): string {
  state.idCounter += 1
  return `${prefix}${state.idCounter}`
}

/** The counter part of an id such as `m12`, so ids order by creation rather than as text. */
function idNumber(id: string): number {
  return Number(id.replace(/^\D+/, ''))
}

/** Orders ids by their counter: the "id order" Machines are evaluated in. */
export function compareIds(a: string, b: string): number {
  return idNumber(a) - idNumber(b)
}
