var scene;
var camera;
var renderer = new THREE.WebGLRenderer();
var light;

var water = new THREE.Object3D();
var terra = new THREE.Object3D();
var pivot = new THREE.Object3D();
var cameraPivot = new THREE.Object3D();

var terGeo;
var terMesh;

var tmat;
var wmat;
var sensors;
var aniid;
var startB = false;

var timet = 0;

var isWorking = false;

var rotSpeed = 0;
var rotHeight = 0;
var command;
var commandlist = ['a', 'b', 'c', 'd', 'e', 'f', 'g','h'];
var commandrun;
var dataIn;
var serial;
var portName = '/dev/cu.usbmodem1411';

var gui = new dat.GUI({
    height: 5 * 32 - 1,
});
var guiParams = {
    newmesh: function() {
        newBlankMesh();
    },
    cone: function() {
        addcone(0.1);
    },
    invertedcone: function() {
        addcone(-0.1);
    },
    sea: function() {
        settheSeaLevel();
    },
    mount: function() {
        addmountains(0.08);
    },
    normalise: function() {
        setNormalize();
    },
    round: function() {
        setRound();
    },
    relax: function() {
        setRelax();
    },
    erode: function() {
        doErode();
    },
    rotval: 0,
    rotH: 0
};

function setup() {
    serial = new p5.SerialPort(); // make a new instance of the serialport library
    serial.on('list', printList); // set a callback function for the serialport list event
    serial.on('connected', serverConnected); // callback for connecting to the server
    serial.on('open', portOpen); // callback for the port opening
    serial.on('data', serialEvent); // callback for when new data arrives
    serial.on('error', serialError); // callback for errors
    serial.on('close', portClose); // callback for the port closing

    serial.list(); // list the serial ports
    serial.open(portName, {
        baudrate: 9600
    });
    //serial.bufferUntil(10); // open a serial port
    serial.clear();
    sensors = [];
}

function printList(portList) {
    // portList is an array of serial port names
    for (var i = 0; i < portList.length; i++) {
        // Display the list the console:
        println(i + " " + portList[i]);
    }
}

// get the list of ports:
function printList(portList) {
    // portList is an array of serial port names
    for (var i = 0; i < portList.length; i++) {
        // Display the list the console:
        println(i + " " + portList[i]);
    }
}

function serverConnected() {
    println('connected to server.');
}

function portOpen() {
    println('the serial port opened.');
}

function serialError(err) {
    println('Something went wrong with the serial port. ' + err);
}

function portClose() {
    println('The serial port closed.');
}

var defaultExtent = {
    width: 1,
    height: 1
};
var defaultPoints = 4800;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 2;
    camera.position.y = 1;
    camera.lookAt(scene.position);
    light = new THREE.DirectionalLight(0xB58D3C, 1);
    light.position.y = 4;
    scene.add(light);
    loadShaders();
    var wgeo = new THREE.CubeGeometry(3, 3, 3);
    water = new THREE.Mesh(wgeo, wmat);
    scene.add(water);
    pivot = new THREE.Object3D();
    cameraPivot = new THREE.Object3D();
    cameraPivot.add(camera);
    scene.add(pivot);
    scene.add(cameraPivot);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x9ae0fe);
    water.rotation.x = Math.radians(90);
    water.position.z = 0;
    water.position.y = -1.5001;
    window.scene = scene;
    window.THREE = THREE;
    startB = true;
    newBlankMesh();
    render();
}

function loadShaders() {
    var cv1, cv2, cv3, cv4, cv5, cv6;
    cv1 = new THREE.Color(0xb48669);
    cv2 = new THREE.Color(0xc9c77f);
    cv3 = new THREE.Color(0x5ab339);
    cv4 = new THREE.Color(0xfcef7e);
    cv5 = new THREE.Color(0x1580c2);
    cv6 = new THREE.Color(0x181d4a);

    var myuniforms = {
        "cv1": {
            type: "v3",
            value: new THREE.Vector3(cv1.r, cv1.g, cv1.b)
        },
        "cv2": {
            type: "v3",
            value: new THREE.Vector3(cv2.r, cv2.g, cv2.b)
        },
        "cv3": {
            type: "v3",
            value: new THREE.Vector3(cv3.r, cv3.g, cv3.b)
        },
        "cv4": {
            type: "v3",
            value: new THREE.Vector3(cv4.r, cv4.g, cv4.b)
        },
        "cv5": {
            type: "v3",
            value: new THREE.Vector3(cv5.r, cv5.g, cv5.b)
        },
        "cv6": {
            type: "v3",
            value: new THREE.Vector3(cv6.r, cv6.g, cv6.b)
        }
    };
    var uniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib.ambient,
        THREE.UniformsLib.lights,
        myuniforms
    ]);
    tmat = new THREE.ShaderMaterial({
        vertexShader: $('#vertexshader').text(),
        fragmentShader: $('#fragmentshader').text(),
        shading: THREE.FlatShading,
        lights: true,
        uniforms: uniforms,
        side: THREE.DoubleSide
    });
    wmat = new THREE.MeshPhongMaterial({
        color: 0x13436b,
        shading: THREE.FlatShading,
        shininess: 0,
        side: THREE.DoubleSide,
        specular: 0x000000,
        transparent: true,
        opacity: 0.8
    });
}

function render() {
    timet++;
    if (timet > 300) {

        //check to see that there's actually a string there:

    }
    timet++;
    if (timet > 300) {
        //serialEvent();
        timet = 0;
        //var inString = serial.available();
        serial.write('x');
    }
    aniid = requestAnimationFrame(render);
    if (startB) {
        water.rotation.z += 0 + ((rotSpeed || 0) * 1);
        pivot.rotation.y -= 0 + ((rotSpeed || 0) * 1);
        cameraPivot.rotation.x = Math.radians(rotHeight);
        renderer.render(scene, camera);
    }
}
init();

function serialEvent() {
    // read a string from the serial port
    // until you get carriage return and newline:
    var command = serial.readString();
    //console.log(inString);
    //inString = serial.available();
    serial.clear();
    serial.write('x');
    if (command !== null) {
        for (var v = 0; v < commandlist.length; v++) {
            if (command == commandlist[v]) commandrun = v;
        }
        switch (commandrun) {
            case 0:
                newBlankMesh();
                break;
            case 1:
                addcone(0.1);
                break;
            case 2:
            addcone(-0.1);
            break;
            case 3:
            addmountains(0.08);
            break;
            case 4:
            settheSeaLevel();
            break;
            case 5:
            setNormalize();
            break;
            case 6:
            setRound();
            break;
            case 7:
            doErode();
            console.log(commandrun);
            break;
            default:
                console.log(commandrun);
                break;

        }
    }
    //check to see that there's actually a string there:

}








    function M_To_Object(geo) {
        cancelAnimationFrame(aniid);
        if (startB === true) {
            var rot = 0;
            rot = pivot.rotation.y;
            scene.remove(terra);
            scene.remove(pivot);
            terra = null;
            terra = new THREE.Mesh(geo, tmat);
            scene.add(terra);
            pivot = new THREE.Object3D();
            pivot.add(terra);
            scene.add(pivot);
            terra.position.x = 0;
            terra.position.z = 0;
            terra.rotation.x = Math.radians(90);
            pivot.rotation.y = rot;
        }
        render();
    }

    function newBlankMesh() {
        if (serial !== undefined) {
            serial.write('x');
            console.log(rotSpeed);
            console.log(rotHeight);
            console.log(command);
        }
        terMesh = generateGoodMesh(defaultPoints, defaultExtent);
        terMesh = zero(terMesh);
        var triMesh = Delaunay.triangulate(terMesh.mesh.vxs);
        triMesh = createGroupedArray(triMesh, 3);
        terGeo = new THREE.Geometry();
        var vxs = terMesh.mesh.vxs;
        var ext = terMesh.mesh.extent;
        for (var i = 0; i < vxs.length; i++) {
            var vec = new THREE.Vector3(vxs[i][0] * (ext.width * 2), vxs[i][1] * (ext.height * 2), -terMesh[i]);
            terGeo.vertices.push(vec);
        }
        for (var j = 0; j < triMesh.length; j++) {
            var fac = triMesh[j];
            terGeo.faces.push(new THREE.Face3(fac[0], fac[1], fac[2]));
        }
        M_To_Object(terGeo);
    }

    function addToTerra(mesh) {
        var workingGeo = terGeo;
        for (var d = 0; d < mesh.length; d++) {
            workingGeo.vertices[d].z += (mesh[d] * 1);
            terMesh[d] += mesh[d];
        }
        terGeo = workingGeo;
        terGeo.verticesNeedUpdate = true;
        M_To_Object(terGeo);
    }

    function adjustTerra(mesh) {
        var workingGeo = terGeo;
        for (var d = 0; d < mesh.length; d++) {
            terMesh[d] = mesh[d];
            workingGeo.vertices[d].z = (terMesh[d] * 1);

        }
        terGeo = workingGeo;
        terGeo.verticesNeedUpdate = true;
        M_To_Object(terGeo);
    }

    function addcone(strength) {
        var newMesh = cone(terMesh.mesh, strength);
        addToTerra(newMesh);
    }

    function addmountains(strength) {
        var newMesh = mountains(terMesh.mesh, 5, strength);
        newMesh = newMesh.map(function(val) {
            return (-val / 8);
        });
        addToTerra(newMesh);
    }

    function settheSeaLevel() {
        var newMesh = setSeaLevel(terMesh, 0.5);
        adjustTerra(newMesh);
    }

    function setNormalize() {
        var newMesh = normalize(terMesh);
        newMesh = newMesh.map(function(val) {
            return (val / 4) - 0.25;
        });
        adjustTerra(newMesh);
    }

    function setRound() {
        var newMesh = peaky(terMesh);
        newMesh = newMesh.map(function(val) {
            return (val / 4) - 0.25;
        });
        adjustTerra(newMesh);
    }

    function setRelax() {
        var newMesh = relax(terMesh);
        adjustTerra(newMesh);
    }

    function doErode() {
        var newMesh = erode(terMesh, 0.01);
        for (var i = 0; i < terMesh.length; i++) {
            if (newMesh[i] >= 0) {
                newMesh[i] = terMesh[i];
            }
        }
        adjustTerra(newMesh);
    }


    gui.add(guiParams, 'newmesh');
    gui.add(guiParams, 'cone');
    gui.add(guiParams, 'invertedcone');
    gui.add(guiParams, 'sea');
    gui.add(guiParams, 'mount');
    gui.add(guiParams, 'normalise');
    gui.add(guiParams, 'round');
    gui.add(guiParams, 'relax');
    gui.add(guiParams, 'erode');
    var controller = gui.add(guiParams, 'rotval', -0.005, 0.005);
    var hcontroller = gui.add(guiParams, 'rotH', -65, 25);

    controller.onChange(function(value) {
        rotSpeed = guiParams.rotval;
    });
    hcontroller.onChange(function(value) {
        rotHeight = guiParams.rotH;
    });
