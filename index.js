/**
 * @author Jakub Zasański <jakub.zasanski.dev@gmail.com>
 * @version 2.0.0
 */

import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import PluginError from 'plugin-error';
import { Transform } from "node:stream";

const PLUGIN_NAME = 'gulp-size-difference';

const log = (msg) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false });
    console.log(`[${chalk.gray(time)}] ${msg}`);
};

const getFileSize = (file) => file.contents?.length ?? file.stats?.size ?? 0;

const calculateStats = (initial, final) => {
    const diffBytes = initial - final;
    const diffPercent = initial > 0 ? ((final / initial) * 100).toFixed(1) : 0;
    const compressionRatio = initial > 0 ? (diffBytes / initial).toFixed(2) : 0;

    return {
        initialSize: initial,
        finalSize: final,
        diffBytes,
        diffPercent: `${diffPercent}%`,
        compressionRatio,
        prettyInitialSize: prettyBytes(initial),
        prettyFinalSize: prettyBytes(final),
        prettyDiffBytes: prettyBytes(diffBytes),
    };
};

const createTransform = (transform, flush) =>
    new Transform({ transform, flush, objectMode: true, highWaterMark: 16 });

function sizeDifference() {
    return createTransform((file, enc, cb) => {
        if (file.isNull()) return cb(null, file);
        if (file.isStream()) return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));

        file.diffStats = { initialSize: getFileSize(file) };
        cb(null, file);
    });
}

sizeDifference.start = sizeDifference;

sizeDifference.stop = (options = {}) => {
    const {
        singleFiles = false,
        title = 'Optimizer',
        customOutput = defaultOutput
    } = options;

    const totals = { filesCount: 0, initialSize: 0, finalSize: 0 };

    return createTransform(
        (file, enc, cb) => {
            if (file.isNull()) return cb(null, file);
            if (file.isStream()) return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));

            const initial = file.diffStats?.initialSize ?? getFileSize(file);
            const final = getFileSize(file);

            totals.initialSize += initial;
            totals.finalSize += final;
            totals.filesCount++;

            if (singleFiles) {
                const stats = calculateStats(initial, final);
                customOutput(title, file.relative, stats);
            }

            cb(null, file);
        },
        (cb) => {
            if (!singleFiles && totals.filesCount > 0) {
                const stats = calculateStats(totals.initialSize, totals.finalSize);
                stats.filesCount = totals.filesCount;
                customOutput(title, 'all files', stats);
            }
            cb();
        }
    );
};

function defaultOutput(title, label, data) {
    const prefix = title ? `${chalk.cyan(title)} ` : '';
    const subject = label ? `${chalk.green(label)} ` : '';
    const details = chalk.gray(`(saved ${data.prettyDiffBytes} - ${data.diffPercent})`);

    log(`${prefix}${subject}${details}`);
}

export default sizeDifference;