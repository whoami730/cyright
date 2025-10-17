cdef type v = NULL

cdef class X:
    def func(self):
        cdef type cls = type(self) # expect-unused: "cls" is not accessed
    
    cdef type cls2 = NULL
