```
# Build Failure Analysis: 2025_03_15_patch_1997

## First error

../../ui/gtk/gtk_ui.cc:633:30: error: no matching function for call to 'gdk_display_map_keycode'
  633 |         GtkCheckVersion(4) ? gdk_display_map_keycode(display, keycode, &keys,

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The code attempts to pass `&keys` to the `gdk_display_map_keycode` function, where `keys` is now a `base::span<GdkKeymapKey>`. However, `gdk_display_map_keycode` expects a `GdkKeymapKey**`, so this fails to compile. The function has not been updated to take a span.  The `gdk_display_map_keycode` function is defined in GTK, a third-party library. Since third-party code cannot be rewritten, the rewriter should not have attempted to spanify the `GetKeyboardLayoutMap` function, as this requires spanifying the call site to this third-party code.

## Solution
The rewriter should avoid spanifying functions if it requires rewriting call sites in third party code.

## Note
The `gdk_keymap_get_entries_for_keycode` function also expects a `GdkKeymapKey**`.