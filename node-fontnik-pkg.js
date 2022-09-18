const fs = require("fs");
const path = require("path");

const fontnik = require("fontnik");
const glyphCompose = require("@mapbox/glyph-pbf-composite");

// Hack to make pkg bundle glyph-pbf-composite properly
var _messages = fs.readFileSync(path.join(__dirname, 'node_modules/@mapbox/glyph-pbf-composite/proto/glyphs.proto'));

const DEBUG = false;

const outputDir = "FontsTmp";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const doFonts = function (fonts) {
  const makeGlyphs = function (config) {
    const sourceFonts = {};

    const folderName = outputDir + "/" + config.name;

    config.sources.forEach(function (sourceName) {
      if (!sourceFonts[sourceName]) {
        try {
          sourceFonts[sourceName] = fs.readFileSync(sourceName);
        } catch (e) {
          console.log(e);
        }
      }
    });

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    const histogram = new Array(256);

    const doRange = function (start, end) {
      return Promise.all(config.sources.map(function (sourceName) {
        const source = sourceFonts[sourceName];
        if (!source) {
          console.log('[%s] Source "%s" not found', config.name, sourceName);
          return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
          fontnik.range({
            font: source,
            start: start,
            end: end,
          }, function (err, data) {
            if (err) {
              reject(new Error(err));
            } else {
              resolve(data);
            }
          });
        });
      })).then(function (results) {
        results = results.filter(function (r) {
          return !!r;
        });
        const combined = glyphCompose.combine(results);
        const size = combined.length;
        histogram[start / 256] = size;
        if (DEBUG) {
          console.log(
            "[%s] Range %s-%s size %s B",
            config.name,
            start,
            end,
            size,
          );
        }
        fs.writeFileSync(
          folderName + "/" + start + "-" + end + ".pbf",
          combined,
        );
      });
    };

    const ranges = [];
    for (let i = 0; i < 65536; (i = i + 256)) {
      ranges.push([i, Math.min(i + 255, 65535)]);
    }

    console.log("[%s]", config.name);
    let fontPromise;
    if (DEBUG) {
      return ranges.reduce(function (p, range) {
        return p.then(function () {
          return doRange(range[0], range[1]);
        });
      }, Promise.resolve());
    } else {
      fontPromise = Promise.all(ranges.map(function (range) {
        return doRange(range[0], range[1]);
      }));
    }
    return fontPromise;
  };

  return makeGlyphs(fonts);
};


const fonts = JSON.parse(fs.readFileSync("./fonts.json"))
fonts.map((p) => doFonts(p));
