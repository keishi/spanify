# Build Failure Analysis: 2025_03_15_patch_97

## First error

../../chrome/browser/shell_integration_linux.cc:787:21: error: no viable conversion from 'gchar *' (aka 'char *') to 'base::span<gchar>' (aka 'span<char>')
  787 |   base::span<gchar> data_dump = g_key_file_to_data(key_file, &length, NULL);
      |                     ^           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`g_key_file_to_data` is a third-party function which returns a `gchar*`. The rewriter is attempting to assign the return value directly to a `base::span<gchar>`, however the rewriter must construct the span. It is difficult to infer the correct size.

## Solution
Rewriter should generate code to construct a span from the return value, but the size is hard to identify. The generated code should look something like this: `base::span<gchar>(g_key_file_to_data(key_file, &length, NULL), length)`.

## Note
The second error indicates the need for a cast in `strict_cast`, so it's a secondary issue.