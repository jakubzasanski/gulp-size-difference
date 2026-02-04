/**
 * @author Jakub Zasański <jakub.zasanski.dev@gmail.com>
 * @version 2.0.0
 */

import {Readable, Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import chalk from 'chalk';
import sizeDifference from './index.js';

const createMockFile = (name, size) => ({
    relative: name,
    isNull: () => false,
    isStream: () => false,
    contents: Buffer.alloc(size),
    stats: {size},
});

const getTestFiles = () => [
    createMockFile('style.css', 80000),
    createMockFile('header.css', 5000),
    createMockFile('landing.css', 9000),
    createMockFile('footer.js', 10000),
];

const createOptimizer = () => new Transform({
    objectMode: true,
    transform(file, _, cb) {
        const ratio = Math.random() * (0.9 - 0.1) + 0.1;
        const newSize = Math.floor(file.contents.length * ratio);
        file.contents = Buffer.alloc(newSize);
        cb(null, file);
    }
});

async function runScenario(label, stopOptions) {
    console.log(chalk.bold.yellow(`\n--- ${label.toUpperCase()} ---`));

    try {
        await pipeline(
            Readable.from(getTestFiles()),
            sizeDifference.start(),
            createOptimizer(),
            sizeDifference.stop(stopOptions)
        );
        console.log(chalk.bold.green('✔ COMPLETED'));
    } catch (err) {
        console.error(chalk.red(`✘ FAILED: ${err.message}`));
        throw err;
    }
}

async function runTests() {
    await runScenario('Single Files Mode', {
        title: 'Images',
        singleFiles: true
    });

    await runScenario('All Files Mode', {
        title: 'CSS',
        singleFiles: false
    });

    await runScenario('Custom Output', {
        title: 'API Report',
        customOutput: (title, file, data) => {
            console.log(chalk.magenta(`[CUSTOM] ${title} | ${file}`));
            console.table({
                'Initial': data.prettyInitialSize,
                'Final': data.prettyFinalSize,
                'Saved': data.prettyDiffBytes
            });
        }
    });
}

runTests().catch(() => process.exit(1));