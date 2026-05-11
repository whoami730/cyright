cimport import_stub # expect-unused: "import_stub" is not accessed
from import_stub cimport sinf
from import_stub cimport cosf as func

a = sinf
b = func
c = cosf # expect-error: "cosf" is not defined
