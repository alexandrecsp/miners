# Miners

An idle/incremental sci-fi mining game played on the surface of a planet or moon. Machines mine, refine and wear down on their own; the player decides where they stand and how the economy runs.

## World

**Zone**:
One area of planetary surface, holding a Grid. The slice has exactly one Zone.
_Avoid_: Level, map, world

**Grid**:
The square tile layout of a Zone, seen from an isometric camera.
_Avoid_: Board, map

**Tile**:
One square cell of the Grid, addressed by integer column and row. A Tile holds at most one of: a Deposit, a Rock, or nothing; and at most one Machine.
_Avoid_: Cell, square

**Unlocked Area**:
The part of the Grid where Machines may be placed and new Deposits may appear. It grows through an Unlock.
_Avoid_: Playable area, bounds

**Deposit**:
A finite body of one Resource (Ore or Crystal) lying on a Tile, with a remaining amount that mining uses up. A Deposit whose remaining amount reaches zero is depleted and disappears.
_Avoid_: Vein, node, ore patch

**Rock**:
Decorative scenery on a Tile. It holds no Resource and makes its Tile not empty.
_Avoid_: Boulder, obstacle

**Empty Tile**:
A Tile in the Unlocked Area with no Deposit, no Rock and no Machine.

## Resources and storage

**Resource**:
A material the player accumulates: Ore, Crystal or Alloy. Credits are tracked separately and are not a Resource for storage or selling.
_Avoid_: Material, item, good

**Ore**:
The common Resource, mined from Ore Deposits by any Miner.

**Crystal**:
The rarer Resource, mined from Crystal Deposits by the Laser Miner only.

**Alloy**:
The refined Resource, produced only by a Refinery.

**Credits**:
The currency, earned by Sales and spent on Offers, Mods, Repairs, Moves, Storage Upgrades and Shop Refreshes. Credits have no cap.
_Avoid_: Money, cash, gold

**Storage**:
The single global pool that holds the amount of each Resource. Every Machine takes from and adds to Storage directly; there is no logistics.
_Avoid_: Inventory, warehouse, stockpile

**Storage Cap**:
The most of one Resource that Storage can hold. Each Resource has its own Storage Cap.
_Avoid_: Limit, capacity

**Storage Tier**:
A level of one Resource's Storage Cap. Higher Storage Tiers give higher caps.

**Storage Upgrade**:
A purchase that raises one Resource's Storage to its next Storage Tier.
_Avoid_: Upgrade (unqualified), storage mod

## Machines

**Machine Def**:
The static definition of a kind of Machine: its stat ranges, Mod Slot count, wear and pricing data, and which Resources or Recipes it works with.
_Avoid_: Machine type, template, blueprint

**Machine**:
One owned instance of a Machine Def, with its own Base Stats, Condition, Lifetime Wear and fitted Mods. A Machine is either placed on a Tile or waiting in the Machine Inventory.
_Avoid_: Building, unit, structure

**Miner**:
A Machine that takes a Resource out of the Deposit it stands on. The Drill and the Laser Miner are Miners.
_Avoid_: Extractor, harvester

**Drill**:
The cheap Miner with slow Wear. It can stand only on Ore Deposits.

**Laser Miner**:
The fast Miner with heavy Wear and an emissive beam. It can stand on Ore or Crystal Deposits and mines what the Deposit holds.

**Refinery**:
A Machine that turns Resources from Storage into Alloy by following its Recipe. It stands on an Empty Tile.
_Avoid_: Smelter, factory

**Recipe**:
A Refinery's rule for how much of which Resources make one batch of Alloy. The slice has Ore to Alloy and Ore plus Crystal to Alloy.
_Avoid_: Formula, process

**Machine Inventory**:
The owned Machines that are not placed on a Tile, waiting to be placed.
_Avoid_: Hangar, backlog

**Placement**:
Putting a Machine from the Machine Inventory onto a Tile. Placement is free.

**Move**:
Relocating a placed Machine to another Tile, at a Credits cost that grows with the distance.
_Avoid_: Relocate, transfer

**Machine Status**:
What a placed Machine is doing at a moment: Working, Idle (with a reason such as Storage full, Deposit depleted or inputs missing) or Broken.

## Stats

**Stat**:
One of the three numbers that describe a Machine's performance: Rate, Efficiency and Durability.
_Avoid_: Attribute, property

**Rate**:
The Stat for speed: for a Miner, Resource units yielded per second; for a Refinery, Recipe batches processed per second.
_Avoid_: Speed, throughput

**Efficiency**:
The Stat for yield: for a Miner, Resource yielded per unit of Deposit used up; for a Refinery, the multiplier on Alloy produced per batch.
_Avoid_: Yield (as a Stat name), productivity

**Durability**:
The Stat for toughness: higher Durability makes Condition drop more slowly.
_Avoid_: Health, toughness

**Stat Roll**:
The random draw, within its Machine Def's ranges, that fixes a Machine's Base Stats when the Machine is created.
_Avoid_: Reroll (for a single Machine)

**Base Stat**:
A Machine's rolled value of a Stat, before Mods. Base Stats never change after the Stat Roll.

**Effective Stat**:
A Stat after Mods: the Base Stat times the product of the Mods' multipliers, plus the sum of the Mods' flat bonuses. Flat bonuses are not multiplied.
_Avoid_: Final stat, modified stat

## Wear and repair

**Condition**:
A Machine's current state of repair, from 0% to 100%. A Machine's output falls as its Condition falls.
_Avoid_: Health, HP, integrity

**Wear**:
The loss of Condition a Machine suffers while Working.
_Avoid_: Damage, decay

**Lifetime Wear**:
The total Wear a Machine has suffered since it was created. It is never reset, and it makes each later Repair cost more.

**Broken**:
The Machine Status of a Machine whose Condition has reached 0%. A Broken Machine produces nothing until Repaired.

**Repair**:
An instant purchase that restores a Machine's Condition to 100%, costing Credits in proportion to the missing Condition and scaled up by Lifetime Wear.
_Avoid_: Fix, maintenance

## Mods

**Mod Def**:
The static definition of a kind of Mod in the Mod Catalogue: the Stat it changes, whether by multiplier or flat bonus, its value, its price and which Machines it fits.
_Avoid_: Upgrade def

**Mod Catalogue**:
The fixed list of Mod Defs the player can buy from.
_Avoid_: Upgrade shop

**Mod**:
One owned copy of a Mod Def. It is either fitted into a Mod Slot of a Machine or waiting in the Mod Inventory. Fitting a Mod is what "upgrading a Machine" means.
_Avoid_: Upgrade, augment, part

**Mod Slot**:
A place on a Machine that holds one Mod. A Machine Def sets how many Mod Slots its Machines have.
_Avoid_: Socket

**Mod Inventory**:
The owned Mods that are not fitted to any Machine.

## Trade

**Shop**:
Where Machines are bought, from its Shop Stock.
_Avoid_: Store, marketplace

**Shop Stock**:
The current set of Offers in the Shop. It is replaced on a timer or by a paid Shop Refresh.

**Offer**:
One pre-rolled Machine in the Shop Stock, with its Base Stats and price visible before buying.
_Avoid_: Listing, deal

**Shop Refresh**:
Replacing the whole Shop Stock with new Offers, either when the Shop's timer runs out or when the player pays for it.
_Avoid_: Reroll (for the Shop)

**Market**:
Where Resources are sold for Credits, at a Market Price per Resource.
_Avoid_: Exchange, trader

**Market Price**:
The current Credits paid per unit of one Resource. It drifts around its Base Price and is pushed down by the player's Sales.
_Avoid_: Value, rate (Rate is a Stat)

**Base Price**:
The value a Resource's Market Price is pulled back towards over time.

**Price Impact**:
The drop in Market Price caused by a Sale, larger for larger Sales. It fades as the price recovers towards the Base Price.
_Avoid_: Slippage

**Sale**:
Selling an amount of one Resource from Storage on the Market, by the player or by a Sell Order. Nothing is ever sold automatically otherwise.

**Sell Order**:
A standing rule on one Resource: sell when the Market Price is at or above a minimum price, but keep a Reserve in Storage. Sell Orders run in live play and in Offline Progress alike.
_Avoid_: Auto-sell, trade rule

**Reserve**:
The amount of a Resource a Sell Order never sells.

## Progression

**Unlock**:
A permanent gain the player earns when a Lifetime Counter reaches its threshold, such as the Laser Miner, Refinery Mods, a Storage Tier, more Unlocked Area or Sell Orders.
_Avoid_: Milestone (the word is reserved for spec milestones), achievement

**Lifetime Counter**:
A running total that only grows, such as Credits earned or Ore mined, that Unlock thresholds are measured against.
_Avoid_: Stat (Stat means a Machine Stat)

**Starting Kit**:
What a new game begins with: one free Drill with average Base Stats in the Machine Inventory, and a few Credits.

## Time

**Step**:
One advance of the simulation by a length of time, applying every game rule once.
_Avoid_: Update, frame

**Tick**:
One Step in live play, of a fixed tenth of a second.
_Avoid_: Frame

**Last Seen**:
The real-world time at which the game was last saved while open.

**Offline Progress**:
The game's advance over the time the player was away, measured from Last Seen and capped at 8 hours, following the same rules as live play.
_Avoid_: Idle earnings, AFK gains

**Offline Replay**:
How Offline Progress is computed: running the same Step repeatedly with a coarse length of time.

**Away Summary**:
The "while you were away" report of what Offline Progress produced, sold and broke.
_Avoid_: Welcome-back screen

## Persistence

**Game State**:
The single serialisable record of everything about one game in progress.
_Avoid_: Save data, world state

**Save**:
A stored copy of the Game State, with its Save Version.

**Save Version**:
The number identifying the shape of the Game State a Save holds.

**Migration**:
A rule that turns a Save of one Save Version into the next Save Version.
