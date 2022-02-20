
# Three-Dxf

**Three-Dxf** is a javascript viewer for dxf files. It takes dxf objects produced from Dxf-Parser and renders them using
 three.js.

#### Install
```
npm install three-dxf
```

For now we recommend cloning the repo, and starting with our sample. See **Run Samples** below.

![Example of the viewer](https://github.com/gdsestimating/three-dxf/blob/screenshots/screenshots/three-dxf-screenshot.png?raw=true "What the sample looks like")

#### Usage
```javascript
// See index.js in the sample for more details
var parser = new window.DxfParser();
var dxf = parser.parseSync(fileReader.result);
cadCanvas = new ThreeDxf.Viewer(dxf, document.getElementById('cad-view'), 400, 400);
```

#### Run Samples
```
# first, compile three-dxf
> npm install
> npm run build

# then install the sample's dependencies
> cd sample
> npm install

# go back to the root and run http-server to run the sample
> cd ..
> npm install -g http-server@0.9.0
> http-server .
# use `http-server -c-1 .` to prevent caching
```

After performing the steps above, you can see the example at [http://127.0.0.1:8080/sample/index.html](http://127.0.0.1:8080/sample/index.html). You can use the dxf file included in the sample. **NOTE: the latest version of http-server will go into a redirect loop if you exlcude "/index.html" from the url.**


#### Supported DXF Features
Supports:
* Most LW entities (lines, polylines, circles, etc)
* Layers
* Simple Text
* Splines
* Ellipses
* Text and MText (Basic multiline support available in v1.3.0 but not all formatting is supported)
 
Does not yet support:
* Attributes
* 3DSolids
* All types of Leaders
* other less common objects and entities.

