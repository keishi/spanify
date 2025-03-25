# Build Failure Analysis: 150

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 3748, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 3754, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to the `buffer` variable when assigning it to the `data` vector, but is also trying to calculate the size of `buffer` using `buffer.size() * sizeof(decltype(buffer)::value_type)`. The `.data()` call is inserted at the end of the buffer, so there is an overlap.

## Solution
The rewriter needs to ensure that when converting a C-style array to `std::array`, it avoids generating overlapping replacements when also adding `.data()` to the variable. The `.data()` call should be made before the size calculation, or alternatively the size calculation should also consider `.data()`.

## Note
The error is caused when the `data.assign` function has `buffer` argument converted to `std::array` and the `.data()` must be called while the size is also calculated.