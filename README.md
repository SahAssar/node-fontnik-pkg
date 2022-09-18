# node-fontnik-pkg

node-fontnik only has builds for node v14 and below (and even then the build seems to break often), so this is a packaged version (via pkg) to more easily generate fonts for maplibre-gl/mapbox-gl

## Usage:

* get a bunch of fonts
* create a json file called `fonts.json` listing what fonts you want and the source paths:
```json
[
  {
    "name": "Noto Sans Regular",
    "sources": [
      "fonts/NotoSans-Regular.ttf"
    ]
  }
]
```
* run `./node-fontnik-pkg` from one of the releases in this repo
* and then you have a folder called FontsTmp with SDF files for use in maplibre-gl/mapbox-gl
