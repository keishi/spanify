# Build Failure Analysis: 2025_03_19_patch_583

## First error

../../services/device/public/cpp/generic_sensor/sensor_mojom_traits.cc:42:28: error: member reference base type 'std::array<double, 4> (const device::SensorReading &)' is not a structure or union

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter mistakenly applied `.size()` and `decltype` to `values`, treating it as an array or span when it was not. `values` belongs to `SensorReading` which is passed by const reference. The correct way to access `values`'s member functions is `data.raw.values.size()`. This happened because the rewriter made a bad assumption about `values` being spanified or arrayified.

## Solution
The rewriter should ensure that when it is trying to access a `member.size()` it verifies that the member is spanified or arrayified and not part of a class variable passed by reference. It also needs to be able to correctly replace the sizes of the raw variable with the correct member names like `data.raw.values.size()`.

## Note
The second error in the log, related to `decltype(values)`, is a direct consequence of the first error. The third error is the result of the same problem in a different place. The same fix should correct all three errors.