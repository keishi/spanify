# Build Failure Analysis: 2025_03_19_patch_737

## First error

Overlapping replacements: ./media/formats/mp4/box_reader_unittest.cc at offset 2600, length 16: "(kSkipBox.size() * sizeof(decltype(kSkipBox)::value_type))" and offset 2606, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to perform two overlapping replacements on the same line of code. It's trying to replace `sizeof(kSkipBox)` with `(kSkipBox.size() * sizeof(decltype(kSkipBox)::value_type))` and add `.data()` to the `kSkipBox` variable at the same time. The added `.data()` is causing an overlap.

## Solution
The rewriter needs to avoid applying multiple replacements in a way that causes them to overlap. It needs to either perform the replacements in a specific order to avoid the overlap, or combine the replacements into a single replacement. In this case, the rewriter probably shouldn't generate `(kSkipBox.size() * sizeof(decltype(kSkipBox)::value_type))` at all, since it can just use `kSkipBox.size()` after converting the array into a `std::array`.

## Note
The error "Applied 7 edits (1 errors) to 1 files [100.00%]" means that the rewriter was able to complete, even though some errors happened. This is not desirable because some code could have been changed, and some code not, leading to incorrect code. The rewriter should stop if it encounters any overlapping replacements.