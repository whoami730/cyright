/*
 * utils.ts
 * Test utils
 */

import * as assert from 'assert';
import * as path from 'path';

import { DiagnosticCategory } from '../../common/diagnostic';
import { DiagnosticSink } from '../../common/diagnosticSink';
import * as TestUtils from '../../tests/testUtils';

export const sampleDir = path.join('tests', 'samples');
export function sampleFile(filename: string) {
    return path.join('../../tests-cython', sampleDir, filename);
}

export interface ExpectedDiagnostic {
    category: DiagnosticCategory;
    messageSubstring: string;
    startLine: number; // 1-based line number
    startChar?: number;
    endLine?: number;
    endChar?: number;
}

const categoryMap: Record<string, DiagnosticCategory> = {
    error: DiagnosticCategory.Error,
    warning: DiagnosticCategory.Warning,
    information: DiagnosticCategory.Information,
    unusedcode: DiagnosticCategory.UnusedCode,
    unreachablecode: DiagnosticCategory.UnreachableCode,
    deprecated: DiagnosticCategory.Deprecated,
};

const categoryNameMap: Record<DiagnosticCategory, string> = {
    [DiagnosticCategory.Error]: 'Error',
    [DiagnosticCategory.Warning]: 'Warning',
    [DiagnosticCategory.Information]: 'Information',
    [DiagnosticCategory.UnusedCode]: 'UnusedCode',
    [DiagnosticCategory.UnreachableCode]: 'UnreachableCode',
    [DiagnosticCategory.Deprecated]: 'Deprecated',
};


export function extractInlineExpectations(content: string): ExpectedDiagnostic[] {
    const regex = /#\s*expect-(error|warning|information|unusedcode|unreachablecode|deprecated):\s*(.+)/gi;
    const expectations: ExpectedDiagnostic[] = [];
    const lines = content.split('\n');

    lines.forEach((line, i) => {
        for (const match of line.matchAll(regex)) {
            const [, catKey, message, startLineStr, startCharStr, endLineStr, endCharStr] = match;

            if (!catKey) continue;
            const category = categoryMap[catKey.toLowerCase()];
            if (category === undefined) {
                throw new Error(`Unknown diagnostic category '${catKey}' on line ${i + 1}`);
            }

            const expected: ExpectedDiagnostic = {
                category,
                messageSubstring: message.trim(),
                startLine: i + 1,
            };

            if (startLineStr) {
                expected.startLine = parseInt(startLineStr);
                expected.startChar = parseInt(startCharStr);
                expected.endLine = parseInt(endLineStr);
                expected.endChar = parseInt(endCharStr);
            }

            expectations.push(expected);
        }
    });

    return expectations;
}

export function runDiagnosticTest(fileName: string) {
    const content = TestUtils.readSampleFile(sampleFile(fileName));
    const expected = extractInlineExpectations(content);

    const diagSink = new DiagnosticSink();
    const parseInfo = TestUtils.parseSampleFile(sampleFile(fileName), diagSink);
    const diags = diagSink.fetchAndClear();

    assert.ok(parseInfo.parseResults.parseTree.statements.length > 0, `${fileName}: parse failed`);

    expected.forEach((exp) => {
        const match = diags.find((d) => {
            const actualStartLine = d.range.start.line + 1;
            const actualStartChar = d.range.start.character;
            const actualEndLine = d.range.end.line + 1;
            const actualEndChar = d.range.end.character;

            const lineMatch = exp.startLine === actualStartLine;
            const msgMatch = d.message.includes(exp.messageSubstring);
            const catMatch = d.category === exp.category;

            const rangeMatch =
                exp.startChar === undefined
                    ? true
                    : actualStartLine === exp.startLine &&
                      actualStartChar === exp.startChar &&
                      actualEndLine === exp.endLine &&
                      actualEndChar === exp.endChar;

            return catMatch && msgMatch && lineMatch && rangeMatch;
        });

        const errMsg =
            `${fileName}:${exp.startLine} → Expected ${categoryNameMap[exp.category]} "${exp.messageSubstring}" at ` +
            (exp.startChar ? `[${exp.startLine}:${exp.startChar}-${exp.endLine}:${exp.endChar}]` : `${exp.startLine}`) +
            ` but not found.\n` +
            `Got:\n${diags
                .map(
                    (d) =>
                        `${categoryNameMap[d.category]} [${d.range.start.line + 1}:${d.range.start.character}-${d.range.end.line + 1}:${
                            d.range.end.character
                        }]: ${d.message}`
                )
                .join('\n')}`;

        assert.ok(match !== undefined, errMsg);
    });

    // Optionally check for unexpected diagnostics
    const unexpected = diags.filter(
        (d) =>
            !expected.some(
                (exp) =>
                    exp.category === d.category &&
                    exp.startLine === d.range.start.line + 1 &&
                    d.message.includes(exp.messageSubstring)
            )
    );

    assert.strictEqual(
        unexpected.length,
        0,
        `${fileName}: unexpected diagnostics found:\n${unexpected
            .map((d) => `\t${categoryNameMap[d.category]} (line ${d.range.start.line + 1}): ${d.message}`)
            .join('\n')}`
    );
}
