# Build Failure Analysis: 2025_05_02_patch_1614

## First error

```
../../content/browser/content_index/content_index_database.cc:314:39: error: no viable conversion from 'const std::array<char, 21>' to 'const std::string' (aka 'const basic_string<char>')
  314 |       service_worker_registration_id, kEntryPrefix,
      |                                       ^~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kEntryPrefix` from `char[]` to `std::array<char, 21>`.  However, the code constructs a `std::string` using `kEntryPrefix` directly:

```c++
return kEntryPrefix + id;
```

Since `kEntryPrefix` is now a `std::array`, this no longer works. `std::array` cannot be implicitly converted to a `std::string` or a `const char*`.

## Solution
The rewriter needs to add `.data()` when a `char[]` variable is converted to `std::array` and used in a context where a `const char*` is expected, such as constructing a `std::string`.  The corrected code should be:

```c++
return kEntryPrefix.data() + id;
```

## Note
The error occurs in multiple places:
*   `content_index_database.cc:314`
*   `content_index_database.cc:439`

A similar error also occurs when passing the arrayified variable in a vector:
*   `content_index_database.cc:525`