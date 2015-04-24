
# Three-Dxf

**Three-Dxf** is a javascript viewer for dxf files. It takes dxf objects produced from Dxf-Parser and renders them using
 three.js.

#### Install
```
// Coming soon
//bower install three-dxf
```

For now we recommend cloning the repo, and starting with our sample. See **Run Samples** below.

#### Usage
TODO

#### Run Samples
```
> npm install -g http-server
> cd sample
> http-server .
# use `http-server -c-1 .` to prevent caching
```

After performing the steps above, you can see the example at localhost:8080. You can use the dxf file included in the sample.

#### Current Version v0.0.1
Supports:
* Headers
* Most Simple entities (lines, polylines, circles, etc)
* Layers
* Some support for line types
* Simple Text
 
Does not yet support:
* Attributes
* 3DSolids
* All types of Leaders
* MText
* other less common objects and entities.

#### Run Tests
TODO

#### Contributors
bzuillsmith@gdsestimating.com
