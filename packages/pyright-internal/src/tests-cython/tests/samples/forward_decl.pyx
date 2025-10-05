cdef class X() # forward decl class

cdef int f(int arg) # forward decl func

cdef class X:
    pass

cdef int f(int arg):
    return 1