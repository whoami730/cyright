cdef type v = NULL

cdef class X:
    def func(self):
        cdef type cls = type(self)
    
    cdef type cls2 = NULL
