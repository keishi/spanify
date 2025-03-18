# Build Failure Analysis: 2025_03_14_patch_181

## First error

../../ui/gtk/gtk_ui.cc:633:30: error: no matching function for call to 'gdk_display_map_keycode'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The function signature was changed to take a span, but the call site wasn't updated to create a span and instead passes a `GdkKeymapKey**` which doesn't match the function requirements.

## Solution
The rewriter needs to update call sites where functions have been spanified.

## Note
The second error `../../ui/gtk/gtk_ui.cc:635:30:` seems to be related to the first error.