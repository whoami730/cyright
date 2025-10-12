import * as fs from 'fs';
import * as path from 'path';

import { runDiagnosticTest, sampleDir } from './utils';

const testName = path.basename(__filename).replace(path.extname(__filename), '');
const paths = fs.readdirSync(sampleDir).filter((name) => name.endsWith('.pyx') || name.endsWith('.pxd'));

paths.forEach((fn) => {
    test(`${testName} ${fn}`, () => {
        runDiagnosticTest(fn);
    });
});
