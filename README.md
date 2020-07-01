
# three-dxf-loader

**three-dxf-loader** is a javascript DXF file loader for THREE.js. It takes URL to a DXF file and creates THREE.js mesh entities. It internally uses Dxf-Parser for parsing and then renders them using
 three.js.

#### Install
```
yarn add "https://github.com/prolincur/three-dxf-loader.git#master"
```

#### Usage
```javascript
const loader = new DXFLoader();
// loader.setFont(font); // set fonts
const scene = new THREE.Scene();
onLoad = (data) => {
    if (data && data.entities) {
      data.entities.forEach(ent => scene.add(ent))
    }
}
const onError = (error) => {
  console.log(error);
}
const onProgress = (xhr) => {
  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}
loader.load(url, onLoad, onProgress, onError);
```

#### Run Web Viewer Sample
For now we recommend cloning the repo, and starting with our sample. See **Run Samples** below.

![Example of the viewer](https://github.com/gdsestimating/three-dxf/blob/screenshots/screenshots/three-dxf-screenshot.png?raw=true "What the sample looks like")

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

