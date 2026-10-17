# Seeded random generator stored in the Game State

Every random draw (Stat Rolls, Shop Stock, Deposit spawns, Market drift) comes from a seeded generator whose state is stored in the Game State, never from `Math.random`. This makes core tests deterministic and means a reload continues the same sequence, so a player cannot reroll a Shop Stock or a Stat Roll by reloading; the cost is that the generator must be threaded through every rule that draws.
