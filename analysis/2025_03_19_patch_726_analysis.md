# Build Failure Analysis: 103

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 6203, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 6209, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to perform two conflicting replacements in the same area of the code. The first replacement is likely due to RewriteArraySizeof, and the second is due to the need to add .data() when passing a `std::array` to a function that expects a pointer.

## Solution
The rewriter needs to be fixed to avoid overlapping replacements. The rewriter logic should be modified to avoid performing the first replacement if it overlaps with a second replacement that is required to add `.data()`. Also the logic to add `.data()` on `std::array` should also calculate the `size()` using `buffer.size() * sizeof(decltype(buffer)::value_type)` like it did before arrayifying.

## Note
This looks like the rewriter is getting confused by `data.assign(buffer, buffer + sizeof(buffer));` and trying to spanify the `sizeof` but this is not the correct way to do it.