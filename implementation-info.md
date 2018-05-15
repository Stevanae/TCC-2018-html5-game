# Jerboa Implementation Requirements

* The game accommodates an arbitrary number of rows and columns. Graphics need to look good at both the largets possible size (fewest rows/columns) and the smallest possible size. To make "Jerboa made it across the board?" calculations easier, the board will have some "extra cells" in the data type, to avoid index errors.

* Each tile of the board can contain an entity. The entity may either be a Jerboa (the "arrow" in GROT), or an object that "stops" a Jerboa (the "dead tile" mentioned in the brainstorm.

* To take a turn, the player can either touch a "Jerboa" entity to make a move, or touch a non-Jerboa entity to alter it (if they are in possession of a "powerup" that allows them to).

* All controls will be with single mouse taps (or screen touches, though mobile browsers usually "translate" this into mouse taps). All game entities and UI elements must be large enough to press easily, and at all points of the game where input is needed, the elements will be still and non-animated. This ensures that the input will be accessible to everyone, on the widest possible range of devices, including mobile.

* There is a game timer, and a turn-count. The player is kicked out of the minigame (or instructed to try again) if either of these elements reaches zero. The UI interfaces that show these are also clickable, which is how to apply altering "powerups" (to give extra time, or extra turns).

* The game should be able to be full-screened. It should accommodate the smallest screen in use (568x320 is still around as a smartphone screen), and look nice at the most common smartphone screen (1280x720) as well as desktop and tablet screens. Graphics should be clearly readable at 100dpi and not require "hidpi" screens to comprehened gameplay.