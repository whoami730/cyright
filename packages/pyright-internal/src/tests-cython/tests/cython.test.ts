/*
 * cython.test.ts
 * Explicit per-file diagnostic tests for Cython samples
 */

import { runDiagnosticTest } from './cythonTestUtils';

// TODO: fix all broken tests

test('bad_type_cdef.pyx', () => {
    runDiagnosticTest('bad_type_cdef.pyx');
});

test('ccastaddress.pyx', () => {
    runDiagnosticTest('ccastaddress.pyx');
});

test('ccastchecked.pyx', () => {
    runDiagnosticTest('ccastchecked.pyx');
});

test('cclass.pxd', () => {
    runDiagnosticTest('cclass.pxd');
});

test.skip('cclass.pyx', () => {
    runDiagnosticTest('cclass.pyx');
});

test.skip('cdefvar.pyx', () => {
    runDiagnosticTest('cdefvar.pyx');
});

test.skip('cenum.pyx', () => {
    runDiagnosticTest('cenum.pyx');
});

test('cextern.pyx', () => {
    runDiagnosticTest('cextern.pyx');
});

test.skip('cfunction.pyx', () => {
    runDiagnosticTest('cfunction.pyx');
});

test.skip('clegacyproperty.pyx', () => {
    runDiagnosticTest('clegacyproperty.pyx');
});

test('cmacro.pyx', () => {
    runDiagnosticTest('cmacro.pyx');
});

test.skip('cppclass.pxd', () => {
    runDiagnosticTest('cppclass.pxd');
});

test.skip('cppclass.pyx', () => {
    runDiagnosticTest('cppclass.pyx');
});

test.skip('cppclassoperators.pyx', () => {
    runDiagnosticTest('cppclassoperators.pyx');
});

test.skip('cpptransform.pyx', () => {
    runDiagnosticTest('cpptransform.pyx');
});

test.skip('cstruct.pyx', () => {
    runDiagnosticTest('cstruct.pyx');
});

test.skip('csuite.pyx', () => {
    runDiagnosticTest('csuite.pyx');
});


test.skip('ctransform.pyx', () => {
    runDiagnosticTest('ctransform.pyx');
});

test.skip('ctypedef.pyx', () => {
    runDiagnosticTest('ctypedef.pyx');
});

test.skip('forward_decl.pyx', () => {
    runDiagnosticTest('forward_decl.pyx');
});

test('import.pyx', () => {
    runDiagnosticTest('import.pyx');
});

test('new_keyword.pyx', () => {
    runDiagnosticTest('new_keyword.pyx');
});

test('type_as_class.pyx', () => {
    runDiagnosticTest('type_as_class.pyx');
});