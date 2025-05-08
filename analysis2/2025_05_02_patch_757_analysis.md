# Build Failure Analysis: 2025_05_02_patch_757

## First error

../../base/posix/safe_strerror.cc:38:37: error: no viable conversion from 'base::span<char>' to 'char *'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `wrap_posix_strerror_r` takes a `char*` as an argument, which is then used to call `strerror_r_ptr`. The rewriter attempted to change the argument to `base::span<char>`, but `strerror_r_ptr` is a function pointer that is assigned to either `strerror_r` or `gnu_strerror_r`. These functions are part of the system library, which should be excluded from spanification. Since the system library code cannot be changed, the code to spanify `wrap_posix_strerror_r` should not have been changed either.

## Solution
The rewriter should check if any function pointer arguments are called. If those functions are in system headers, then that argument should not be spanified.

## Note
There are other errors in the file. Specifically:

*   Error comparing span to nullptr.
*   Attempting to call `.size()` and `.data()` on a `char[]` variable, even though those methods don't exist.

```c++
../../base/posix/safe_strerror.cc:38:37: error: no viable conversion from 'base::span<char>' to 'char *'
   38 |   char* rc = (*strerror_r_ptr)(err, buf, len);
      |                                     ^~~
../../base/posix/safe_strerror.cc:39:10: error: invalid operands to binary expression ('char *' and 'base::span<char>')
   39 |   if (rc != buf) {
      |       ~~ ^  ~~~
../../base/posix/safe_strerror.cc:98:11: error: invalid operands to binary expression ('base::span<char>' and 'std::nullptr_t')
   98 |   if (buf == nullptr || len <= 0) {
      |       ~~~ ^  ~~~~~~~
../../base/posix/safe_strerror.cc:111:33: error: member reference base type 'char[256]' is not a structure or union
  111 |   safe_strerror_r(err, buf, (buf.size() * sizeof(decltype(buf)::value_type)));
      |                              ~~~^~~~~
../../base/posix/safe_strerror.cc:111:50: error: 'decltype(buf)' (aka 'char[256]') is not a class, namespace, or enumeration
  111 |   safe_strerror_r(err, buf, (buf.size() * sizeof(decltype(buf)::value_type)));
      |                                                  ^
../../base/posix/safe_strerror.cc:112:25: error: member reference base type 'char[256]' is not a structure or union
  112 |   return std::string(buf.data());
      |                      ~~~^~~~~