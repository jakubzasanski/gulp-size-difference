/**
 * @author Jakub Zasański <jakub.zasanski.dev@gmail.com>
 * @version 1.1.0
 */

// #####################################################################################################################

import log from 'fancy-log';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import PluginError from 'plugin-error';
import {Transform} from "node:stream";

// #####################################################################################################################

const transformStream = (transform, flush) => new Transform({transform, flush, objectMode: true, highWaterMark: 16});

/**
 *
 * @returns {module:stream.internal.Transform}
 */
function sizeDifference() {
    return transformStream((file, encoding, callback) => {
        if (file.isNull()) {
            callback(null, file);
            return;
        }

        if (file.isStream()) {
            callback(new PluginError('gulp-size-difference', 'Streaming not supported'));
            return;
        }

        file.diffStats = {
            initialSize: file.contents && file.contents.length || file.stats && file.stats.size || 0
        };

        callback(null, file)
    });
}

sizeDifference.start = sizeDifference;

sizeDifference.stop = (options = {}) => {
    const formatDataFunction = (options.customFormat && typeof options.customFormat === 'function') ? options.customFormat : formatData;
    options.allFiles = options.allFiles || false;

    const diffStats = {
        filesCount: 0,
        initialSize: 0,
        finalSize: 0,
        diffBytes: 0,
        diffPercent: 0,
        compressionRatio: 0
    };

    return transformStream((file, encoding, callback) => {

        if (file.isNull()) {
            callback(null, file);
            return;
        }

        if (file.isStream()) {
            callback(new PluginError('gulp-size-difference', 'Streaming not supported'));
            return;
        }

        file.diffStats.finalSize = file.contents && file.contents.length || file.stats && file.stats.size || 0;

        diffStats.initialSize += file.diffStats.initialSize;
        diffStats.finalSize += file.diffStats.finalSize;

        if (options.allFiles === true) {
            file.diffStats.filesCount = 1;
            file.diffStats.diffBytes = file.diffStats.initialSize - file.diffStats.finalSize;
            file.diffStats.diffPercent = ((file.diffStats.finalSize !== 0 && file.diffStats.initialSize !== 0) ? ((file.diffStats.finalSize / file.diffStats.initialSize) * 100).toFixed(1) : 0) + '%';
            file.diffStats.compressionRatio = (file.diffStats.diffBytes !== 0 && file.diffStats.initialSize !== 0) ? file.diffStats.diffBytes / file.diffStats.initialSize : 0;
            file.diffStats.prettyInitialSize = prettyBytes(file.diffStats.initialSize);
            file.diffStats.prettyFinalSize = prettyBytes(file.diffStats.finalSize);
            file.diffStats.prettyDiffBytes = prettyBytes(file.diffStats.diffBytes);

            formatDataFunction(options.title, file.relative, file.diffStats, true);
        }

        diffStats.filesCount++;
        callback(null, file);

    }, (callback) => {

        if (options.allFiles === true) {
            callback();
            return;
        }

        diffStats.diffBytes = diffStats.initialSize - diffStats.finalSize;
        diffStats.diffPercent = ((diffStats.finalSize !== 0 && diffStats.initialSize !== 0) ? (((diffStats.finalSize / diffStats.initialSize) + Number.EPSILON) * 100).toFixed(1) : 0) + '%';
        diffStats.compressionRatio = (diffStats.diffBytes !== 0 && diffStats.initialSize !== 0) ? (diffStats.diffBytes / diffStats.initialSize).toFixed(2) : 0;
        diffStats.prettyInitialSize = prettyBytes(diffStats.initialSize);
        diffStats.prettyFinalSize = prettyBytes(diffStats.finalSize);
        diffStats.prettyDiffBytes = prettyBytes(diffStats.diffBytes);

        formatDataFunction(options.title, 'all files', diffStats, false);

        callback();
    });
};

function formatData(title = '', file = '', data = {}, options = {}) {
    title = title ? chalk.cyan(title) + ' ' : title;
    file = file ? chalk.green(file) + ' ' : file;
    log(`${title}${file}${chalk.gray(`(saved ${data.prettyDiffBytes} - ${data.diffPercent})`)}`);
}

export default sizeDifference;

// EOF
