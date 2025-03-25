# Build Failure Analysis: 2025_03_19_patch_552

## First error

../../ui/gtk/x/gtk_event_loop_x11.cc:55:3: error: no matching function for call to 'gdk_display_map_keycode'
   55 |   gdk_display_map_keycode(gdk_display_get_default(),
      |   ^~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:11:10: note: candidate function not viable: no known conversion from 'base::span<guint> *' (aka 'span<unsigned int> *') to 'guint **' (aka 'unsigned int **') for 4th argument
   11 | gboolean gdk_display_map_keycode(GdkDisplay* display, guint keycode, GdkKeymapKey** keys, guint** keyvals, int* n_entries);
      |          ^                                                                                ~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `keyvals` variable, but failed to update the call site for `gdk_display_map_keycode`. The function `gdk_display_map_keycode` expects a `guint**`, but the rewriter is passing a `base::span<guint>*`. This is a type mismatch, leading to the compile error.

## Solution
The rewriter needs to identify and spanify the parameters at the call site in order to have the types match.

## Note
No other errors found.