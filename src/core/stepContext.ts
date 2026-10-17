/** Per-Step scratch shared down the Pipeline; created fresh by each Step and never part of the Game State. */
export interface StepContext {
  /** For each Machine id that produced in this Step, the share (0 to 1] of its potential output it produced. */
  outputShares: Map<string, number>
}
