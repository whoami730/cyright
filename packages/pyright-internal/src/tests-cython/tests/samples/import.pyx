cimport libc.math # expect-unused: "libc.math" is not accessed
from libc.math cimport sinf
from libc.math cimport cosf as func

a = sinf
b = func
c = cosf # expect-error: "cosf" is not defined
