# Build Failure Analysis: 2025_05_02_patch_1128

## First error

../../remoting/host/xsession_chooser_linux.cc:259:26: error: expected unqualified-id
  259 |   if (base::span<gchar*> !desktop_names.empty() =
      |                          ^

## Category
Rewriter needs to handle spanified variable used as a boolean.

## Reason
The rewriter converted `gchar** desktop_names` to `base::span<gchar*> desktop_names;` and also tried to add `!desktop_names.empty()` for boolean check. However the added code generated invalid syntax: `if (base::span<gchar*> !desktop_names.empty() =`

## Solution
The rewriter should not have added `base::span<gchar*>` in the if statement and instead it should have generated `if (!desktop_names.empty())`. The span is in a if statement so it should use .empty().

## Note
The remaining errors are also related to this.