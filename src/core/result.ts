import type { StringId } from './strings'

/** Result type: an expected failure is a value carrying a string-id reason, never a throw. */
export type Result<T> = { ok: true; value: T } | { ok: false; reason: StringId }

export const ok = <T>(value: T): Result<T> => ({ ok: true, value })
export const fail = (reason: StringId): Result<never> => ({ ok: false, reason })
