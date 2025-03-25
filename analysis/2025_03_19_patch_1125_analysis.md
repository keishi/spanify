```
# Build Failure Analysis: 2025_03_19_patch_1125

## First error

../../dbus/message_unittest.cc:305:40: error: cannot initialize a parameter of type 'const double **' with an rvalue of type 'base::span<const double> *' (aka 'span<const double> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The function `PopArrayOfDoubles` is expecting a `const double** doubles` as its first parameter. But the code is passing the address of a `base::span<const double>* output_doubles`.

## Solution
The rewriter needs to spanify the call site of `PopArrayOfDoubles` in `message_unittest.cc`. Change this line:

```c++
ASSERT_TRUE(reader.PopArrayOfDoubles(&output_doubles, &length));
```

to:

```c++
ASSERT_TRUE(reader.PopArrayOfDoubles(output_doubles.data(), &length));
```

## Note
This appears to be the only error.