# Build Failure Analysis: 2025_03_19_patch_1730

## First error

../../net/filter/brotli_source_stream.cc:167:24: error: no viable conversion from 'size_t *' (aka 'unsigned long *') to 'base::span<size_t>' (aka 'span<unsigned long>')
  167 |     base::span<size_t> array =
      |                        ^
  168 |         reinterpret_cast<size_t*>(malloc(size + sizeof(size_t)));

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter is creating a `base::span` from a `size_t*` obtained via `reinterpret_cast`. This cast is invalid since `base::span` is not just a raw pointer; it's a structure that holds both a pointer and a size. You can't simply reinterpret a block of memory as a `base::span`.

## Solution
Instead of using `reinterpret_cast` to create the `base::span`, the rewriter should allocate memory using a `std::vector<size_t>` or `std::unique_ptr<size_t[]>` to properly construct the span.

```c++
std::unique_ptr<size_t[]> array_ptr(new size_t[(size + sizeof(size_t))/sizeof(size_t)]);
base::span<size_t> array(array_ptr.get(), (size + sizeof(size_t))/sizeof(size_t));
if (array.empty())
  return nullptr;
```

## Note
The generated code also contains an `.empty()` check where it is not needed. The rewriter can avoid creating it in the first place.
```c++
-   if (array.empty()) {
+    if (array.empty()) {