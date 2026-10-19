import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './uiStore'

const view = () => useUiStore.getState().openView
const initialState = useUiStore.getState()
const resetStore = () => useUiStore.setState(initialState, true)

describe('UI Store open HUD view', () => {
  beforeEach(resetStore)

  it('opening a view makes it the open view, and opening another replaces it', () => {
    useUiStore.getState().openHudView('market')
    expect(view()).toBe('market')
    useUiStore.getState().openHudView('mods')
    expect(view()).toBe('mods')
  })

  it('toggling the open view closes it', () => {
    useUiStore.getState().openHudView('market')
    useUiStore.getState().toggleHudView('market')
    expect(view()).toBeNull()
  })

  it('toggling a different view switches to it', () => {
    useUiStore.getState().openHudView('market')
    useUiStore.getState().toggleHudView('base')
    expect(view()).toBe('base')
  })

  it('closing clears the open view', () => {
    useUiStore.getState().openHudView('machines')
    useUiStore.getState().closeHudView()
    expect(view()).toBeNull()
  })

  it('closing with no view open leaves it closed', () => {
    useUiStore.getState().closeHudView()
    expect(view()).toBeNull()
  })
})

describe('UI Store auto-close of the open HUD view', () => {
  beforeEach(() => {
    resetStore()
    useUiStore.setState({ openView: 'machines' })
  })

  it('starting a Placement closes the open view', () => {
    useUiStore.getState().startPlacing('m1')
    expect(view()).toBeNull()
  })

  it('starting a Move closes the open view', () => {
    useUiStore.getState().startMoving('m1')
    expect(view()).toBeNull()
  })

  it('selecting a Machine closes the open view', () => {
    useUiStore.getState().select('m1')
    expect(view()).toBeNull()
  })

  it('deselecting leaves the open view as it is', () => {
    useUiStore.getState().select(null)
    expect(view()).toBe('machines')
  })

  it('cancel closes the open view', () => {
    useUiStore.getState().cancel()
    expect(view()).toBeNull()
  })
})

describe('UI Store opening a view clears the Machine inspector and Placement', () => {
  beforeEach(resetStore)

  it('opening a view clears the selection', () => {
    useUiStore.setState({ selectedMachineId: 'm1' })
    useUiStore.getState().openHudView('market')
    expect(useUiStore.getState().selectedMachineId).toBeNull()
  })

  it('opening a view cancels a Placement', () => {
    useUiStore.getState().startPlacing('m1')
    useUiStore.getState().openHudView('market')
    expect(useUiStore.getState().mode).toEqual({ kind: 'none' })
  })

  it('toggling a view open cancels a Move and clears the selection', () => {
    useUiStore.getState().startMoving('m1')
    useUiStore.getState().toggleHudView('base')
    expect(useUiStore.getState().mode).toEqual({ kind: 'none' })
    expect(useUiStore.getState().selectedMachineId).toBeNull()
  })

  it('toggling the open view closed leaves the selection alone', () => {
    useUiStore.getState().openHudView('base')
    useUiStore.setState({ selectedMachineId: 'm1' })
    useUiStore.getState().toggleHudView('base')
    expect(useUiStore.getState().selectedMachineId).toBe('m1')
  })

  it('closing a view leaves the selection alone', () => {
    useUiStore.getState().openHudView('base')
    useUiStore.setState({ selectedMachineId: 'm1' })
    useUiStore.getState().closeHudView()
    expect(useUiStore.getState().selectedMachineId).toBe('m1')
  })
})
