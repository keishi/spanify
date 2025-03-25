# Build Failure Analysis: 2025_03_19_patch_1982

## First error

../../ui/gtk/gtk_ui.cc:633:30: error: no matching function for call to 'gdk_display_map_keycode'
  633 |         GtkCheckVersion(4) ? gdk_display_map_keycode(display, keycode, &keys,
      |                              ^~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:11:10: note: candidate function not viable: no known conversion from 'base::span<guint> *' (aka 'span<unsigned int> *') to 'guint **' (aka 'unsigned int **') for 4th argument
   11 | gboolean gdk_display_map_keycode(GdkDisplay* display, guint keycode, GdkKeymapKey** keys, guint** keyvals, int* n_entries);
      |          ^                                                                                ~~~~~~~~~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The code attempts to pass the address of a `base::span<guint>` to a function that expects `guint**`. The rewriter was unable to convert the `guint** keyvals` to `base::span<guint>` in `gdk_display_map_keycode` and `gdk_keymap_get_entries_for_keycode` due to missing source code. The rewriter then proceeded to spanify the variable and failed to add `.data()` to the argument.

## Solution
The rewriter should add `.data()` when passing spanified variable to a function that expects a raw pointer.

## Note
The function declaration in gdk.sigs is not available for rewriting and thus is seen as a third party function.