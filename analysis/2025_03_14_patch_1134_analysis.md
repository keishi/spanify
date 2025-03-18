# Build Failure Analysis: 2025_03_14_patch_1134

## First error

../../base/trace_event/trace_arguments.cc:268:17: error: no viable conversion from 'span<element_type>' (aka 'span<char>') to 'const char *'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `StringStorage::data()` which is part of the base code. But `CopyTraceEventParameter` is third party code (trace_event), and was not spanified, thus causing a type mismatch. The rewriter needs to avoid spanifying code if it would require rewriting excluded code.

```
267   if (alloc_size) {
268 |   const char* end = ptr.subspan(alloc_size);
```

## Solution
Do not rewrite the code when it requires crossing the boundary between base code and third party code.

## Note
Other related errors:

```
../../base/trace_event/trace_arguments.cc:270:7: error: no matching function for call to 'CopyTraceEventParameter'
  270 |       CopyTraceEventParameter(&ptr, extra_string1, end);
      |       ^~~~~~~~~~~~~~~~~~~~~~~
../../base/trace_event/trace_arguments.cc:44:6: note: candidate function not viable: no known conversion from 'base::span<char> *' to 'char **' for 1st argument
   44 | void CopyTraceEventParameter(char** buffer,
      |      ^                       ~~~~~~~~~~~~~
../../base/trace_event/trace_arguments.cc:282:49: error: invalid operands to binary expression ('base::span<char>' and 'const char *')
  282 |     DCHECK_EQ(end, ptr) << "Overrun by " << ptr - end;
      |                                             ~~~ ^ ~~~