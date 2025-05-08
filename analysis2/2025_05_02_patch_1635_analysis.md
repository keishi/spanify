# Build Failure Analysis: 2025_05_02_patch_1635

## First error

../../base/check_op.h:229:26: error: invalid operands to binary expression ('const char *const' and 'const std::array<char, 8>')

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The code is using `DCHECK_EQ(durable_name->data(), histogram_data_ptr->name);`. After spanifying `histogram_data_ptr->name`, the type of that expression is `std::array<char, 8>`. However `durable_name->data()` returns `const char* const`. `DCHECK_EQ` uses `operator==` to compare its parameters, but there isn't an overload of `operator==` that takes a `const char* const` and a `std::array<char, 8>`. This is because the rewriter spanified one side of the expression but not the other, so it should have spanified both or none.

## Solution
Spanify `durable_name`.

## Note
There is another error of the same type later `StatisticsRecorder::ForgetHistogramForTesting(data->name);`.