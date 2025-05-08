# Build Failure Analysis: 2025_05_02_patch_1129

## First error

../../remoting/host/xsession_chooser_linux.cc:276:34: error: no viable conversion from 'const gchar *const *' (aka 'const char *const *') to 'base::span<const gchar *const>' (aka 'span<const char *const>')
  276 |   base::span<const gchar* const> system_data_dirs = g_get_system_data_dirs();
      |                                  ^                  ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `g_get_system_data_dirs()` returns `const gchar* const*`, which is a null-terminated array of C-style strings. The rewriter is trying to assign this directly to a `base::span<const gchar* const>`, but there's no implicit conversion. The `base::span` needs to be constructed with a size, which is not directly available from the return value of the function.

## Solution
The rewriter needs to generate code to iterate through the null-terminated array returned by `g_get_system_data_dirs()` to determine its size, and then construct a `base::span` from the array and the calculated size.  This would involve creating a temporary variable to hold the size and then using that variable to construct the span.

Example:

```c++
  const gchar* const* system_data_dirs_ptr = g_get_system_data_dirs();
  size_t system_data_dirs_size = 0;
  while (system_data_dirs_ptr[system_data_dirs_size] != nullptr) {
    system_data_dirs_size++;
  }
  base::span<const gchar* const> system_data_dirs(system_data_dirs_ptr, system_data_dirs_size);
```

## Note
`g_get_system_data_dirs` returns a null-terminated array, which requires iteration to determine the size.