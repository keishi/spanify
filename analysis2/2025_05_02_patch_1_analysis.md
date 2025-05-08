# Build Failure Analysis: 2025_05_02_patch_1

## First error

../../ui/gtk/gtk_ui.cc:635:30: error: no matching function for call to 'gdk_display_map_keycode'
  635 |         GtkCheckVersion(4) ? gdk_display_map_keycode(display, keycode, &keys,
      |                              ^~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The code passes the address of `keys` to the function `gdk_display_map_keycode`:
```c++
    GdkKeymapKey* keys = nullptr;
    guint* keyvals = nullptr;
    gint n_entries = 0;
    
    ... gdk_display_map_keycode(display, keycode, &keys, ...
```
After spanifying `keys`, the type of `keys` is `base::span<GdkKeymapKey> keys = {}`. The type of argument being passed is `base::span<GdkKeymapKey>*` while the function expects a `GdkKeymapKey**`. The rewriter spanified the local variable `keys`, but failed to recognize that the address of the spanified variable is being passed to the function. It needs to spanify the call site as well.

## Solution
The rewriter should be able to handle the case where the address of a variable is passed to a function that the rewriter spanifies. The type conversion is not implicit so the rewriter should create a temporary pointer variable to pass to the function, and then use the temporary variable to create a new span.
```c++
    GdkKeymapKey* keys_ptr = nullptr;
    guint* keyvals = nullptr;
    gint n_entries = 0;
    
    ... gdk_display_map_keycode(display, keycode, &keys_ptr, ...
    base::span<GdkKeymapKey> keys(keys_ptr, n_entries);
```

## Note
The other error is related to the same root cause:

```
../../ui/gtk/gtk_ui.cc:637:30: error: no matching function for call to 'gdk_keymap_get_entries_for_keycode'
  637 |                            : gdk_keymap_get_entries_for_keycode(
      |                              ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:6:10: note: candidate function not viable: no known conversion from 'base::span<GdkKeymapKey> *' (aka 'span<_GdkKeymapKey> *') to 'GdkKeymapKey **' (aka '_GdkKeymapKey **') for 3rd argument
    6 | gboolean gdk_keymap_get_entries_for_keycode(GdkKeymap* keymap, guint hardware_keycode, GdkKeymapKey** keys, guint** keyvals, gint* n_entries);
      |          ^                                                                             ~~~~~~~~~~~~~~~~~~~