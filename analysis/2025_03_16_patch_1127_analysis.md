# Build Failure Analysis: 2025_03_16_patch_1127

## First error

../../media/midi/midi_message_queue.cc:32:10: error: no matching member function for call to 'insert'
   32 |   queue_.insert(queue_.end(), data, data.subspan(length));
      |   ~~~~~~~^~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `MidiMessageQueue::Add` is now taking a `base::span` as argument `data`. However, `queue_.insert` is being called with `data` and `data.subspan(length)`. `data` is a `base::span`, but `insert` is expecting a pointer type for the second argument. A similar error would have occurred with `char*` or `uint8_t*`.

## Solution
Replace `data` in the call to insert to `data.begin()` and replace `data.subspan(length)` to `data.begin() + length` to pass the begin and end iterators into insert function.

```c++
queue_.insert(queue_.end(), data.begin(), data.begin() + length);