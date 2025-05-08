# Build Failure Analysis: 2025_05_02_patch_412

## First error

```
../../ui/events/ozone/evdev/microphone_mute_switch_event_converter_evdev.cc:23:30: error: member reference base type 'unsigned long[1]' is not a structure or union
   23 |             EVIOCGSW((bitmask.size() * sizeof(decltype(bitmask)::value_type))),
      |                       ~~~~~~~^~~~~
```

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The code was originally:
```c++
  unsigned long bitmask[EVDEV_BITS_TO_LONGS(SW_MAX)] = {};
  if (ioctl(fd, EVIOCGSW(sizeof(bitmask)), bitmask) < 0) {
```

and it was changed to:
```c++
  unsigned long bitmask[EVDEV_BITS_TO_LONGS(SW_MAX)] = {};
  if (ioctl(fd,
            EVIOCGSW((bitmask.size() * sizeof(decltype(bitmask)::value_type))),
            bitmask) < 0) {
```

The rewriter rewrote `sizeof(bitmask)` to `(bitmask.size() * sizeof(decltype(bitmask)::value_type)))`. However, `bitmask` is still a raw array. Thus, `.size()` is not a valid member of `bitmask`. The rewriter shouldn't have modified this line.

## Solution
Rewriter should not add `.size()` for raw arrays.

## Note
The other error is caused by the first error.
```
../../ui/events/ozone/evdev/microphone_mute_switch_event_converter_evdev.cc:23:47: error: 'decltype(bitmask)' (aka 'unsigned long[1]') is not a class, namespace, or enumeration
   23 |             EVIOCGSW((bitmask.size() * sizeof(decltype(bitmask)::value_type))),
      |                                               ^