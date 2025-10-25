/*
 * cythonTestUtils.ts
 * Cython test utils
 */

import assert from 'assert';
import * as path from 'path';

import { DiagnosticCategory } from '../../common/diagnostic';
import * as TestUtils from '../../tests/testUtils';

// Borrowed from testUtils.ts
(global as any).__rootDirectory = path.resolve('../../');


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
    unused: DiagnosticCategory.UnusedCode,
    unreachable: DiagnosticCategory.UnreachableCode,
    deprecated: DiagnosticCategory.Deprecated,
};

const categoryNameMap: Record<DiagnosticCategory, string> = {
    [DiagnosticCategory.Error]: 'Error',
    [DiagnosticCategory.Warning]: 'Warning',
    [DiagnosticCategory.Information]: 'Information',
    [DiagnosticCategory.UnusedCode]: 'Unused',
    [DiagnosticCategory.UnreachableCode]: 'Unreachable',
    [DiagnosticCategory.Deprecated]: 'Deprecated',
    [DiagnosticCategory.TaskItem]: 'TaskItem', // Not relevant, should be ignored.
};


export function extractInlineExpectations(content: string): ExpectedDiagnostic[] {
    // Matches multiple expect-* blocks per line
    const blockRegex =
        /#\s*expect-(error|warning|information|unused|unreachable|deprecated):\s*([^#]+)/gi;

    // Matches each message, optionally with a range: message [1:5-1:10]
    // eslint-disable-next-line no-useless-escape
    const messageRegex = /\s*("?[^;,#\[\]]+?"?)(?:\s*\[(\d+):(\d+)-(\d+):(\d+)\])?(?=,|;|$)/g;

    const expectations: ExpectedDiagnostic[] = [];
    const lines = content.split('\n');

    lines.forEach((line, i) => {
        const blockMatches = [...line.matchAll(blockRegex)];
        for (const block of blockMatches) {
            const [, catKey, messages] = block;
            if (!catKey || !messages) continue;

            const category = categoryMap[catKey.toLowerCase()];
            if (category === undefined) {
                throw new Error(`Unknown diagnostic category '${catKey}' on line ${i + 1}`);
            }

            // Extract each message within the block
            const msgMatches = [...messages.matchAll(messageRegex)];

            for (const msg of msgMatches) {
                const [, msgText, sLine, sChar, eLine, eChar] = msg;

                const messageSubstring = msgText.trim();
                if (!messageSubstring) continue;

                const expected: ExpectedDiagnostic = {
                    category,
                    messageSubstring,
                    startLine: i + 1, // default to this line if no explicit position
                };

                if (sLine && sChar && eLine && eChar) {
                    expected.startLine = parseInt(sLine);
                    expected.startChar = parseInt(sChar);
                    expected.endLine = parseInt(eLine);
                    expected.endChar = parseInt(eChar);
                }

                expectations.push(expected);
            }
        }
    });

    return expectations;
}

export function validateInlineResults(
    results: TestUtils.FileAnalysisResult[],
    expectations: ExpectedDiagnostic[]
) {
    assert.strictEqual(results.length, 1);

    const fileResult = results[0];

    // fileResult.parseResults
    const allDiags = [
        ...fileResult.errors,
        ...fileResult.warnings,
        ...fileResult.infos,
        ...fileResult.unusedCodes,
        ...fileResult.unreachableCodes,
        ...fileResult.deprecateds,
    ];

    // --- 1. Check that every expected diagnostic actually occurred ---
    expectations.forEach((exp) => {
        const match = allDiags.find((d) => {
            const actualStartLine = d.range.start.line + 1; // convert to 1-based
            const actualStartChar = d.range.start.character;
            const actualEndLine = d.range.end.line + 1;
            const actualEndChar = d.range.end.character;

            const catMatch = d.category === exp.category;
            const msgMatch = d.message.includes(exp.messageSubstring);
            const lineMatch = actualStartLine === exp.startLine;

            const rangeMatch =
                exp.startChar === undefined
                    ? true // ignore range if not specified
                    : actualStartLine === exp.startLine &&
                      actualStartChar === exp.startChar &&
                      actualEndLine === exp.endLine &&
                      actualEndChar === exp.endChar;

            return catMatch && msgMatch && lineMatch && rangeMatch;
        });

        const errMsg =
            `\nExpected ${categoryNameMap[exp.category]} "${exp.messageSubstring}" at ` +
            (exp.startChar
                ? `[${exp.startLine}:${exp.startChar}-${exp.endLine}:${exp.endChar}]`
                : `line ${exp.startLine}`) +
            ` but not found.\n\n` +
            `Diagnostics available:\n${allDiags
                .map(
                    (d) =>
                        `  ${categoryNameMap[d.category]} [${d.range.start.line + 1}:${
                            d.range.start.character
                        }-${d.range.end.line + 1}:${d.range.end.character}]: ${d.message}`
                )
                .join('\n')}`;

        assert.ok(match !== undefined, errMsg);
    });

    // --- 2. Check that there are no unexpected diagnostics ---
    const unexpected = allDiags.filter(
        (d) =>
            !expectations.some(
                (exp) =>
                    exp.category === d.category &&
                    d.message.includes(exp.messageSubstring) &&
                    exp.startLine === d.range.start.line + 1
            )
    );

    assert.strictEqual(
        unexpected.length,
        0,
        `Unexpected diagnostics found:\n${unexpected
            .map(
                (d) =>
                    `  ${categoryNameMap[d.category]} [${d.range.start.line + 1}:${
                        d.range.start.character
                    }-${d.range.end.line + 1}:${d.range.end.character}]: ${d.message}`
            )
            .join('\n')}`
    );
}

export const sampleDir = path.join('tests', 'samples');
export function sampleFile(filename: string) {
    return path.join('../../tests-cython', sampleDir, filename);
}

export function runDiagnosticTest(fileName: string) {
    const content = TestUtils.readSampleFile(sampleFile(fileName));
    const expected = extractInlineExpectations(content);
    const results = TestUtils.typeAnalyzeSampleFiles([sampleFile(fileName)])
    validateInlineResults(results, expected);
}
