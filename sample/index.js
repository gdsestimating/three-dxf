
var progress = document.getElementById('file-progress-bar');
var $progress = document.getElementsByClassName('progress')[0];

var $cadview = document.getElementById('cad-view');
var dxfContentEl = document.getElementById('dxf-content');
var cadCanvas;

// Setup the drag and drop file listeners.
// var dropZone = document.getElementById('drop-zone');
// dropZone.addEventListener('dragover', handleDragOver, false);
// dropZone.addEventListener('drop', onFileSelected, false);

document.getElementById('dxf').addEventListener('change', onFileSelected, false);


function onFileSelected(evt) {
    progress.style.width = '0%';
    progress.textContent = '0%';

    var file = evt.target.files[0];
    var output = [];
    output.push('<li><strong>', encodeURI(file.name), '</strong> (', file.type || 'n/a', ') - ',
        file.size, ' bytes, last modified: ',
        file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a',
        '</li>');
    document.getElementById('file-description').innerHTML = '<ul>' + output.join('') + '</ul>';

    $progress.classList.add('loading');

    var reader = new FileReader();
    reader.onprogress = updateProgress;
    reader.onloadend = onSuccess;
    reader.onabort = abortUpload;
    reader.onerror = errorHandler;
    reader.readAsText(file);
}

function abortUpload() {
    console.log('Aborted read!')
}

function errorHandler(evt) {
    switch(evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
        alert('File Not Found!');
        break;
    case evt.target.error.NOT_READABLE_ERR:
        alert('File is not readable');
        break;
    case evt.target.error.ABORT_ERR:
        break; // noop
    default:
        alert('An error occurred reading this file.');
    }
}

function updateProgress(evt) {
    console.log('progress');
    console.log(Math.round((evt.loaded /evt.total) * 100));
    if(evt.lengthComputable) {
        var percentLoaded = Math.round((evt.loaded /evt.total) * 100);
        if (percentLoaded < 100) {
            progress.style.width = percentLoaded + '%';
            progress.textContent = percentLoaded + '%';
        }
    }
}

function onSuccess(evt){
    var fileReader = evt.target;
    if(fileReader.error) return console.log("error onloadend!?");
    progress.style.width = '100%';
    progress.textContent = '100%';
    setTimeout(function() { $progress.classList.remove('loading'); }, 2000);
    var parser = new window.DxfParser();
    var dxf = parser.parseSync(fileReader.result);
    
    if(dxf) {
        dxfContentEl.innerHTML = JSON.stringify(dxf, null, 2);
    } else {
        dxfContentEl.innerHTML = 'No data.';
    }

    // Three.js changed the way fonts are loaded, and now we need to use FontLoader to load a font
    //  and enable TextGeometry. See this example http://threejs.org/examples/?q=text#webgl_geometry_text
    //  and this discussion https://github.com/mrdoob/three.js/issues/7398 
    var font;
    var loader = new THREE.FontLoader();
    loader.load( 'fonts/helvetiker_regular.typeface.json', function ( response ) {
        font = response;
        cadCanvas = new window.ThreeDxf.Viewer(dxf, document.getElementById('cad-view'), 1000, 800, font);
    });
    
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
