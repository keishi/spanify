# Build Failure Analysis: 2025_03_19_patch_566

## First error

../../chrome/browser/shell_integration_linux.cc:678:21: error: no viable conversion from 'gchar *' (aka 'char *') to 'base::span<gchar>' (aka 'span<char>').

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `g_key_file_to_data` is a GLib function (likely in `third_party`). The rewriter converted the `gchar* data_dump = ...` to `base::span<gchar> data_dump = ...`. However the rewriter does not know how to construct a span object out of a raw pointer return value from a third party function call.

## Solution
The rewriter needs to generate code to construct a span from the return value of a third_party function, but the size is available. If size information is available, the rewriter can use a `base::make_span` call.
In this particular case, rewrite this line
```c++
base::span<gchar> data_dump = g_key_file_to_data(key_file, &length, NULL);
```
to
```c++
base::span<gchar> data_dump = base::make_span(g_key_file_to_data(key_file, &length, NULL), length);
```

## Note
Also there is a second error related to `base::numerics::safe_conversions::strict_cast` missing the integer conversion. However this error will disappear if the previous error is fixed.

```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../chrome/browser/shell_integration_linux.cc:684:43: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  684 |       output_buffer += (data_dump.subspan(1).data());
      |                                           ^