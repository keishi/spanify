# Build Failure Analysis: 2025_03_19_patch_551

## First error

../../ui/gtk/x/gtk_event_loop_x11.cc:55:3: error: no matching function for call to 'gdk_display_map_keycode'
   55 |   gdk_display_map_keycode(gdk_display_get_default(),
      |   ^~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:11:10: note: candidate function not viable: no known conversion from 'base::span<GdkKeymapKey> *' (aka 'span<_GdkKeymapKey> *') to 'GdkKeymapKey **' (aka '_GdkKeymapKey **') for 3rd argument
   11 | gboolean gdk_display_map_keycode(GdkDisplay* display, guint keycode, GdkKeymapKey** keys, guint** keyvals, int* n_entries);
      |          ^                                                           ~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `gdk_display_map_keycode` expects a `GdkKeymapKey**` but the rewriter is passing the address of a `base::span<GdkKeymapKey>`, which is a different type. The rewriter spanified `keys`, but failed to spanify the call site.

## Solution
The rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.
```c++
   GdkKeymapKey* temp_keys = nullptr;
   guint* keyvals = nullptr;
   gint n_entries = 0;
   gdk_display_map_keycode(gdk_display_get_default(),
                            gdk_key_event_get_keycode(gdk_event), &temp_keys,
                            &keyvals, &n_entries);
    base::span<GdkKeymapKey> keys = {};
    if(temp_keys) {
      keys = base::span<GdkKeymapKey>(temp_keys, n_entries);
    }
```

## Note
Secondary error was:
```
../../ui/gtk/x/gtk_event_loop_x11.cc:62:12: error: member reference base with null pointer of type 'base::span<GdkKeymapKey>' (aka 'span<_GdkKeymapKey>')
   62 |     if (!keys.empty()) {
```
This was caused by the fact that the rewriter didn't account for the possibility that `gdk_display_map_keycode` could return null. This is already accounted for in the proposed solution.
```