cdef s # expect-error: Expected identifier, "s" is not defined
# start & end char can't be specified because cython marks
# the end of the line as error instead. This is a bug!