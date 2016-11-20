
# Three-Dxf

**Three-Dxf** is a javascript viewer for dxf files. It takes dxf objects produced from Dxf-Parser and renders them using
 three.js.

#### Install
```
bower install three-dxf
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
> cd sample
> bower install
> npm install -g http-server
> http-server .
# use `http-server -c-1 .` to prevent caching
```

After performing the steps above, you can see the example at localhost:8080. You can use the dxf file included in the sample.

Note that the sample contains some three.js extras for Text support. If you wish to view text in DXF files, you will need those extras.


#### Supported DXF Features
Supports:
* Header
* Most LW entities (lines, polylines, circles, etc)
* Layers
* Some support for line types
* Simple Text
* Viewport
 
Does not yet support:
* Attributes
* 3DSolids
* All types of Leaders
* MText
* other less common objects and entities.

#### Contributors
bzuillsmith@gmail.com
