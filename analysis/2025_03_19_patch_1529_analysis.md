```
# Build Failure Analysis: 2025_03_19_patch_1529

## First error

../../chrome/browser/process_singleton_posix.cc:232:44: error: invalid operands to binary expression ('base::span<char>' and 'size_t' (aka 'unsigned long'))
  232 |     ssize_t rv = HANDLE_EINTR(read(fd, buf + bytes_read, bufsize - bytes_read));
      |                                        ~~~ ^ ~~~~~~~~~~
../../base/posix/eintr_wrapper.h:42:14: note: expanded from macro 'HANDLE_EINTR'
   42 |     decltype(x) eintr_wrapper_result;                        \
      |              ^
../../base/time/time.h:513:28: note: candidate function template not viable: no known conversion from 'base::span<char>' to 'TimeDelta' for 1st argument
  513 | inline constexpr TimeClass operator+(TimeDelta delta, TimeClass t) {
      |                            ^         ~~~~~~~~~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
In this case, the rewriter successfully spanified `char* buf` in the function declaration of `ReadFromSocket`:

```
ssize_t ReadFromSocket(int fd,
-                       char* buf,
+                       base::span<char> buf,
                        size_t bufsize,
                        const base::TimeDelta& timeout)
```

However, at the call site of ReadFromSocket:

```
ssize_t len = ReadFromSocket(socket.fd(), buf, kMaxACKMessageLength, timeout);
```

the variable `buf` is a `std::array`, and it needs to pass `buf.data() + bytes_read` to ReadFromSocket. The rewriter failed to rewrite that as `.subspan()`.

The reason for the error is the macro `HANDLE_EINTR`.

## Solution
The rewriter needs to apply subspan to variables used inside macros correctly.

## Note
```
../../chrome/browser/process_singleton_posix.cc:946:66: error: invalid operands to binary expression ('std::ostream' (aka 'basic_ostream<char>') and 'std::array<char, 9>')
  946 |   NOTREACHED() << "The other process returned unknown message: " << buf;
      |                                                                  ^  
```

The second error happened because:

1.  `buf` was converted to `std::array`.
2.  But operator << for std::array hasn't been defined.

To fix this error, we need to add .data() to `buf` like this:

```
NOTREACHED() << "The other process returned unknown message: " << buf.data();
```

But this requires fixing a different bug with the rewriter: Rewriter added .data() to a variable/member it did not spanify/arrayify.