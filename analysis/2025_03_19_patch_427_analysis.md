# Build Failure Analysis: 2025_03_19_patch_427

## First error

../../ui/gtk/printing/print_dialog_gtk.cc:546:36: error: no viable conversion from 'GtkPageRange *' (aka '_GtkPageRange *') to 'base::span<GtkPageRange>' (aka 'span<_GtkPageRange>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The `gtk_print_settings_get_page_ranges` function returns a raw pointer, but the rewriter expects the return type of the function to be already spanified. Thus, it failed to add generate correct rewriting for the raw pointer return value.

## Solution
Rewriter needs to recognize raw pointer return value and insert code to construct the span from the return value. Also, need to nullptr initialize the spanified member to {}.