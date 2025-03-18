# Build Failure Analysis: 1525

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/mojo/public/cpp/bindings/lib/bindings_internal.h at offset 2638, length 3: ".subspan( *)" and offset 2640, length 1: " "

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to insert both a subspan and a .data() call, but their replacements overlap. This is because the code intends to take a subspan and then get the data from it.

## Solution
The rewriter should recognize that it is attempting to take a subspan and then get the data from it, and combine the two operations into a single .subspan() call that performs the offset.

For example,

```c++
 .subspan( header()->num_bytes).data();
```

Should become

```c++
 .subspan(header()->num_bytes);