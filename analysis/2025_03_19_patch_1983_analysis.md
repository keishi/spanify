# Build Failure Analysis: 2025_03_19_patch_1983

## First error

../../ui/gtk/gtk_ui.cc:633:30: error: no matching function for call to 'gdk_display_map_keycode'
  633 |         GtkCheckVersion(4) ? gdk_display_map_keycode(display, keycode, &keys,
      |                              ^~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:11:10: note: candidate function not viable: no known conversion from 'base::span<GdkKeymapKey> *' (aka 'span<_GdkKeymapKey> *') to 'GdkKeymapKey **' (aka '_GdkKeymapKey **') for 3rd argument
   11 | gboolean gdk_display_map_keycode(GdkDisplay* display, guint keycode, GdkKeymapKey** keys, guint** keyvals, int* n_entries);
      |          ^                                                           ~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `keys` variable, but failed to update the call sites of the `gdk_display_map_keycode` and `gdk_keymap_get_entries_for_keycode` functions. The `gdk_display_map_keycode` function expects a `GdkKeymapKey**` but the rewriter is now passing `base::span<GdkKeymapKey>*`. The same issue applies to the call to `gdk_keymap_get_entries_for_keycode`.

## Solution
The rewriter needs to ensure that when a function is spanified, all call sites are also updated to correctly handle the span. In this specific case, the rewriter should likely have detected the call sites and modified the code to pass `keys.data()` instead of `&keys`.

## Note
The second error is similar to the first one, it also belongs to the same root cause.