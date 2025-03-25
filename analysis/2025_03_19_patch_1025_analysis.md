# Build Failure Analysis: 2025_03_19_patch_1025

## First error

../../net/base/io_buffer.h:97:36: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'char *' is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified a variable, `bytes()`, but left a reinterpret_cast that is applied to it. The rewriter needs to be able to remove it.

```c++
  char* data() { return reinterpret_cast<char*>(bytes()); }
```

## Solution
The rewriter should be able to remove the reinterpret_cast because it is no longer necessary after spanifying the variable.

## Note
The error message is:
```
../../net/base/io_buffer.h:97:36: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'char *' is not allowed
   97 |   base::span<char> data() { return reinterpret_cast<char*>(bytes()); }
      |                                    ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1 error generated.