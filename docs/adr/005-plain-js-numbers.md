# Plain JavaScript numbers, no big-number library

All amounts, prices and Credits are plain JavaScript numbers, shown to the player through one display formatter (1.2K, 3.4M). Many idle games use a big-number library for values past 1e308; the slice's open-ended economy stays far below that, and plain numbers keep the core simple, fast and directly serialisable. Revisit only if balancing ever pushes values towards the double-precision limits.
