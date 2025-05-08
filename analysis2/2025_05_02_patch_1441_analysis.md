# Build Failure Analysis: 2025_05_02_patch_1441

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 6203, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 6209, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type)` and also add `.data()` to the `buffer`. These replacements overlap, causing the error.

## Solution
The rewriter should avoid overlapping replacements. When rewriting `sizeof(buffer)` for an array that will also have `.data()` appended, the rewriter should either:
1.  Apply the `.data()` replacement first, and then rewrite `sizeof(buffer.data())` which will be easier.
2.  Or, generate combined replacements at once, rather than applying multiple replacements.
In this particular case the code should be rewritten like this:
```
data.assign(buffer.data(), buffer.data() + (buffer.size() * sizeof(decltype(buffer)::value_type)));
```

## Note
The rewriter should be careful when applying multiple replacements to the same line of code. It should ensure that the replacements do not overlap and that the resulting code is valid.