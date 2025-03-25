# Build Failure Analysis: 2025_03_19_patch_1605

## First error

../../media/cdm/library_cdm/clear_key_cdm/cdm_file_io_test.h:137:43: error: non-virtual member function marked 'override' hides virtual member function

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `OnReadComplete` function, but did not update the override declaration.

## Solution
The rewriter needs to spanify a call site when it changes the type of a function, including virtual functions in base classes and overrides in derived classes.

## Note
There are also macro related compilation errors because "{}" is being passed in place of a base::span. The span needs to be updated to accept a default value like `base::span<const uint8_t> data = {}`

Also, the parameter to `ADD_TEST_STEP` (i.e., data and data_size) must always be either both there, or both missing. If they are both missing then the rewriter should not replace `nullptr` with `{}` as this causes a compiler error that the implicit base::span is not constructable. The right thing to do is likely to pass a default value for the span in the method signature i.e. `base::span<const uint8_t> data = {}`.