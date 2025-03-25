# Build Failure Analysis: 2025_03_19_patch_653

## First error

../../net/spdy/spdy_session.cc:1932:20: error: no viable conversion from 'net::IOBuffer' to 'base::span<char>' (aka 'span<char>')
 1932 |   base::span<char> data = *read_buffer_;
      |                    ^      ~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The original code used a raw pointer `char* data = read_buffer_->data();` This was then rewritten to `base::span<char> data = *read_buffer_;`. However, `read_buffer_` is a `net::IOBuffer` object, which does not have a direct conversion to `base::span<char>`. The rewriter needs to generate the code necessary to create a span from the `IOBuffer`'s data, likely by calling `.data()` and `.size()`.

## Solution
The rewriter needs to generate code that constructs a span from the `IOBuffer`. This will likely require adding .data() and calculating the size to construct the span correctly. The size may be available with a call to `read_buffer_->size()`.

For example, change

```c++
base::span<char> data = *read_buffer_;
```

to

```c++
base::span<char> data = base::make_span(read_buffer_->data(), read_buffer_->size());
```

## Note
The second error is that ProcessInput requires a `const char*`, but the spanified `data` variable is being passed in directly. This may be related to this rewriter failing to add `.data()` to a spanified variable in a third_party function call. This can be fixed by adding `.data()` to the variable when it is passed into `ProcessInput`.