# Build Failure Analysis: 2025_05_02_patch_906

## First error

```
../../mojo/core/core_ipcz.cc:613:20: error: no viable conversion from 'MojoTrapEvent *' to 'base::span<MojoTrapEvent>'
  613 |   return trap->Arm(blocking_events, num_blocking_events);
      |                    ^~~~~~~~~~~~~~~
```

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `MojoTrap::Arm` was spanified to take `base::span<MojoTrapEvent>` as an argument. However, the call site in `core_ipcz.cc` passes a raw pointer `MojoTrapEvent* blocking_events`. The rewriter should have either converted the raw pointer to a `base::span` or, if the size was unknown, avoided spanifying the function in the first place (Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.). Since we know that span is essentially a `pointer + size`, and that information is passed to the method via `uint32_t* num_blocking_events`, we can create a span from the raw pointer at the call site.

## Solution
The rewriter needs to recognize this pattern and create a `base::span` from the raw pointer and size at the call site:

```c++
  return trap->Arm(base::span<MojoTrapEvent>(blocking_events, *num_blocking_events), num_blocking_events);
```

## Note
It is important to add `#include "base/containers/span.h"` in `core_ipcz.cc` or the file that calls `Arm` function.