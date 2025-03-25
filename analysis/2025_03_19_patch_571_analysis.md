# Build Failure Analysis: 2025_03_19_patch_571

## First error

../../services/device/generic_sensor/platform_sensor.cc:186:3: error: no matching function for call to 'AtomicWriterMemcpy'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `OneWriterSeqLock::AtomicWriterMemcpy` was spanified, but the rewriter failed to recognize the raw pointer `&reading_buffer_->reading` being passed into the function.  The rewriter should have been able to wrap the raw pointer with a span.  In this case the size was implied so it seems like the rewriter failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to be updated to correctly handle raw pointers passed as arguments to spanified functions, even when the size information is not explicitly available. The size information can be derived from the parameter definition if the argument expression is the address of a member.

## Note
The `AtomicWriterMemcpy` function was spanified but the callsite wasn't.