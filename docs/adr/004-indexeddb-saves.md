# Saves in IndexedDB with a versioned Migration chain

Saves go to IndexedDB through idb-keyval as one record holding the Game State and its Save Version, upgraded on load by an ordered chain of Migrations; there is no localStorage mirror. Autosave runs about every 10 seconds and on `visibilitychange` to hidden, and losing up to ~10 seconds of play is accepted. IndexedDB avoids localStorage's small quota and synchronous writes as the Game State grows; a mirror was rejected because a second copy can disagree with the first.
