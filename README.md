

Display files size difference between before and after point of pipeline stream. Designed for measuring efficiency minifying tools like uglify or cssnano.


![version](https://img.shields.io/github/v/tag/jakubzasanski/gulp-size-difference?label=version)
![license](https://img.shields.io/github/license/jakubzasanski/gulp-size-difference)


This package was created for my other project [disco-gulp](https://github.com/jakubzasanski/disco-gulp) look here for full examples.
Based on [gulp-sizediff](https://github.com/SkeLLLa/gulp-sizediff) but provides more flexible output, and some refactoring to modern JS


## Install

```
$ npm install --save-dev gulp-size-difference
```


## Usage

```js
import sizeDifference from 'gulp-size-difference';

gulp.src(currentPaths.development.js + "**/*.js")
  .pipe(plumber({
    errorHandler: errorHandler
  }))
  .pipe(sizeDifference.start())
  .pipe(uglify())
  .pipe(sizeDifference.stop({title: `JS ${group}`}))
  .pipe(rename({"suffix": ".min"}))
  .pipe(gulp.dest(currentPaths.production.js))
  .on("end", _ => {
    callback();
   });

```
 
## Standard output

```
[00:00:00] Starting 'post-js'...
[00:00:00] JS example1.js (saved 116 B - 39%)
[00:00:00] JS example2.js (saved 0 B - 0%)
[00:00:00] Finished 'post-js' after 72 ms
```

```
[00:00:00] Starting 'post-js'...
[00:00:00] JS all files (saved 4.83 kB - 41.8%)
[00:00:00] Finished 'post-js' after 74 ms
```

### sizeDifference.start() or sizeDiff()

Creates a new property on the file object that saves its current size.

### sizeDifference.stop(options)

Counts and outputs the difference between saved size and the current filesize.

## options

#### title

Type: `string`  
Default: ''

Give it a title so it's possible to distinguish the output of multiple instances logging at once.

#### allFiles

Type: `boolean`  
Default: `false`

Run formatData for every file instead of just the total size diff.

#### customFormat
Type: `function`  
Default: 'formatData()'

Customise the output of this by using the format function. An example:

```js
const formatDiff = (title = '', file = '', data = {}, isFile = false) => {
    title = title ? chalk.cyan(title) : title;
    file = file ? ' ' + chalk.green(file) : file;

    let message = `${title}${file}`;

    if (isFile) {
        message += chalk.white(` ~ saved ${prettyBytes(data.diffBytes)} (${Math.round(data.diffPercent * 100)}%)`);
    } else {
        const stats = [
            `Files count: ${data.filesCount}`,
            `Initial size: ${prettyBytes(data.initialSize)}`,
            `Final size: ${prettyBytes(data.finalSize)}`,
            `Difference bytes: ${prettyBytes(data.diffBytes)}`,
            `Difference percent: ${Math.round(data.diffPercent * 100)}%`,
            `Compression ratio: ${data.compressionRatio.toFixed(2)}`
        ];
        stats.forEach(filePath => {
            message += chalk.white(`\n\r${filePath}`);
        });
    }

    log(message);
}

import sizeDifference from 'gulp-size-difference';

gulp.src(currentPaths.development.js + "**/*.js")
    .pipe(plumber({
        errorHandler: errorHandler
    }))
    .pipe(sizeDifference.start())
    .pipe(uglify())
    .pipe(sizeDifference.stop({title: `JS ${group}`, customFormat: formatDiff}))
    .pipe(rename({"suffix": ".min"}))
    .pipe(gulp.dest(currentPaths.production.js))
    .on("end", _ => {
        callback();
    });

```

```
[00:00:00] Starting 'post-js'...
[00:00:00] JS example1.js ~ saved 116 B (39%)
[00:00:00] JS example2.js ~ saved 0 B (0%)
[00:00:00] Finished 'post-js' after 72 ms
```

```
[00:00:00] Starting 'post-js'...
[00:00:00] JS all files
Files count: 2
Initial size: 190 B
Final size: 74 B
Difference bytes: 116 B
Difference percent: 39%
Compression ratio: 0.61
[00:00:00] Finished 'post-js' after 74 ms
```

###### title
Type: `string`  

String given with sizeDiff.stop()

###### file
Type: `string`  

String relative path to file or all files text.

###### data
Type: `Object`  

Difference data object

* Files count: data.filesCount
* Initial size: data.initialSize
* Final size: data.finalSize
* Difference bytes: data.diffBytes
* Pretty initial size: data.prettyInitialSize
* Pretty final size: data.prettyFinalSize
* Pretty difference bytes: data.prettyDiffBytes
* Difference percent: data.diffPercent
* Compression ratio: data.compressionRatio

###### options
Type: `Object`  

Passed options object for detecting output mode.

---

Like my work? Buy me a beer! 🍺

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/donate/?hosted_button_id=KWNT5X4DUL2AY)
