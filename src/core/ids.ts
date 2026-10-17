/** The counter part of an id such as `m12`, so ids order by creation rather than as text. */
function idNumber(id: string): number {
  return Number(id.replace(/^\D+/, ''))
}

/** Orders ids by their counter: the "id order" Machines are evaluated in. */
export function compareIds(a: string, b: string): number {
  return idNumber(a) - idNumber(b)
}
