# Build Failure Analysis: 2025_05_02_patch_1765

## First error

```
../../content/web_test/renderer/event_sender.cc:476:72: error: cannot increment value of type 'base::span<const char *>'
  476 |     for (base::span<const char*> item = kEditableMenuStrings; item[0]; ++item) {
      |                                                                        ^ ~~~~
```

## Category
Rewriter needs to rewrite `char[]` converted to `std::array` used in a `for` loop.

## Reason
The rewriter incorrectly transformed a `const char*[]` array to a `base::span<const char*>`. The original code iterates using a pointer increment in the for loop: `++item`. However, after converting `item` to a `base::span`, `++item` attempts to increment the `span` object itself which is not a pointer and doesn't support pointer arithmetic. The correct way to iterate a span is using an index, or iterators.

## Solution
The rewriter should generate a loop using indices, as shown below.

```c++
   for (size_t i = 0; i < std::size(kEditableMenuStrings); ++i) {
     strings.push_back(kEditableMenuStrings[i]);
   }
```
or
```c++
   for (const char** item = kEditableMenuStrings; *item; ++item) {
     strings.push_back(*item);
   }
```
should become

```c++
   for (size_t i = 0; i < std::size(kEditableMenuStrings); ++i) {
     strings.push_back(kEditableMenuStrings[i]);
   }
```

## Note
The rewriter should recognize this pattern and avoid spanifying in this case.

```
kEditableMenuStrings` is `const char* kEditableMenuStrings[]