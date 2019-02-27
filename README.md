
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
> npm install -g http-server
> http-server .
# use `http-server -c-0 .` to prevent caching
```

After performing the steps above, you can see the example at [http://127.0.0.1:8080/sample](http://127.0.0.1:8080/sample). You can use the dxf file included in the sample.


#### Supported DXF Features
Supports:
* Header
* Most LW entities (lines, polylines, circles, etc)
* Layers
* Some support for line types
* Simple Text
* Viewport
* Splines (Quadratic and Cubic)
* Ellipses
 
Does not yet support:
* Attributes
* 3DSolids
* All types of Leaders
* MText
* other less common objects and entities.

