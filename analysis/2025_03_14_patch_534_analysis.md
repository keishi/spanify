# Build Failure Analysis: 2025_03_14_patch_534

## First error

../../dbus/property.cc:690:49: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Rewriter needs to handle spanified variables being passed to functions expecting `uint8_t**`

## Reason
The rewriter spanified the variable `bytes`, but `PopArrayOfBytes` expects a `uint8_t**`, so the code fails to compile. The rewriter did not update the call site of `PopArrayOfBytes`.

## Solution
The rewriter should emit code to pass `bytes.data()` as the first argument to `PopArrayOfBytes` and `&length` as the second argument to `PopArrayOfBytes`. The code should look like this:
```c++
    const uint8_t* bytes_data = bytes.data();
    if (!entry_reader.PopArrayOfBytes(&bytes_data, &length))
      return false;
```

## Note
Extra errors in the log indicate more instances of the same error.