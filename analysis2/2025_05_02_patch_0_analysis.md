# Build Failure Analysis: 2025_05_02_patch_0

## First error

```
../../ui/gtk/gtk_ui.cc:635:30: error: no matching function for call to 'gdk_display_map_keycode'
  635 |         GtkCheckVersion(4) ? gdk_display_map_keycode(display, keycode, &keys,
      |                              ^~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:11:10: note: candidate function not viable: no known conversion from 'base::span<guint> *' (aka 'span<unsigned int> *') to 'guint **' (aka 'unsigned int **') for 4th argument
   11 | gboolean gdk_display_map_keycode(GdkDisplay* display, guint keycode, GdkKeymapKey** keys, guint** keyvals, int* n_entries);
      |          ^                                                                                ~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter changed `guint* keyvals = nullptr;` to `base::span<guint> keyvals = {};`. Then it passed `&keyvals` to `gdk_display_map_keycode` which expects a `guint**`. The rewriter should have recognized that the function needs to assign a new value to the pointer, and thus should have created a temporary variable to pass to the function, and then use the temporary variable to create a new span.

## Solution
The rewriter should create a temporary `guint*` variable, pass the address of the temporary variable to `gdk_display_map_keycode`, and then create a `base::span<guint>` from the temporary variable.

The generated code should look like this:
```c++
    guint* temp_keyvals = nullptr;
    gint n_entries = 0;
    if (GtkCheckVersion(4)) {
      gdk_display_map_keycode(display, keycode, &keys, &temp_keyvals,
                              &n_entries);
    } else {
      gdk_keymap_get_entries_for_keycode(keymap, keycode, &keys, &temp_keyvals,
                                         &n_entries);
    }
    base::span<guint> keyvals(temp_keyvals, n_entries);
```

## Note
Another error message is similar.
```
../../ui/gtk/gtk_ui.cc:637:30: error: no matching function for call to 'gdk_keymap_get_entries_for_keycode'
  637 |                            : gdk_keymap_get_entries_for_keycode(
      |                              ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/gtk/gdk.sigs:6:10: note: candidate function not viable: no known conversion from 'base::span<guint> *' (aka 'span<unsigned int> *') to 'guint **' (aka 'unsigned int **') for 4th argument
    6 | gboolean gdk_keymap_get_entries_for_keycode(GdkKeymap* keymap, guint hardware_keycode, GdkKeymapKey** keys, guint** keyvals, gint* n_entries);
      |          ^                                                                                                  ~~~~~~~~~~~~~~~