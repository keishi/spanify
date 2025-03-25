# Build Failure Analysis: 2025_03_19_patch_405

## First error

../../media/mojo/services/mojo_cdm_file_io.h:52:66: error: non-virtual member function marked 'final' hides virtual member function

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `MojoCdmFileIO::Write` but failed to spanify the base class's function, which resulted in the hiding of the virtual function. The signatures of the base class's `Write` function and the derived class's `Write` function do not match because one of them is spanified and the other isn't.

## Solution
The rewriter should also spanify the base class `cdm::FileIO::Write` function by applying the rewriter to `../../media/cdm/api/content_decryption_module.h` as well.

## Note
The other error seems to indicate an incorrect call site after spanification.
```
../../media/mojo/services/mojo_cdm_file_io.cc:230:41: error: expected an expression
        std::vector<uint8_t>(data.data(), data.subspan(data_size).data()),
                                         ^