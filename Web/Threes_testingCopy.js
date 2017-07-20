var scene;
var camera;
var renderer;

var water;
var tergeo;
var uniforms;
//debugger;

var tmat;
var wmat;
var timet;
var aniid;

var tsinces = 100;
var eledges;
var Ntri;
var Frun = true;
var terra = null;
var termesh;
var pivot = null;
function matshaders() {
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
    uniforms =
        THREE.UniformsUtils.merge([

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
xxmap = function(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};


var defextent = {
    width: 1,
    height: 1
};
var defpoints = 1000;

function empty(elem) {
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}
// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

createGroupedArray = function(arr, chunkSize) {
    var groups = [],
        i;
    for (i = 0; i < arr.length; i += chunkSize) {
        groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
};

var Geo_Write = function(mesh, tria, wix, dp) {
    //debugger;
    var vmesh = mesh;
    var vwix = wix;
    var vxs = vmesh.mesh.vxs;
    var ext = vmesh.mesh.extent;
    var wgeo = new THREE.Geometry();
    for (var i = 0; i < vxs.length; i++) {
        var vec = new THREE.Vector3(vxs[i][0] - (ext.width), vxs[i][1] - (ext.height), -vmesh[i] + (0.0002 * (Math.random())));
        wgeo.vertices.push(vec);
    }
    wgeo.vertices.push(new THREE.Vector3(0, 0, 2));
    wgeo.vertices.push(new THREE.Vector3(ext.width, 0, 2));
    wgeo.vertices.push(new THREE.Vector3(ext.width, ext.height, 2));
    wgeo.vertices.push(new THREE.Vector3(0, ext.height, 2));
    var waxis = ['x', 'y', 'y', 'z'];
    for (var j = 0; j < 4; j++) {
        //debugger;
        var ds = ['N', 'W', 'E', 'S'];
        var bpts = dp[j];
        var w = ds[j];
        var wl = vwix[w];
        var thisaxis = waxis[j];
        var sidepoints = [];
        for (var pt = 0; pt < wl.length; pt++) {
            var vpos = wl[pt];
            var ftri = wgeo.vertices[vpos];
            sidepoints.push(ftri[thisaxis]);
            sidepoints.push(ftri.z);
        }
        sidepoints = createGroupedArray(sidepoints, 2);
        sidepoints.sort(function(a, b) {
            return a[0] - b[0];
        });
        var botpoint1 = wgeo.vertices[vxs.length + dp[j][0]];
        var botpoint2 = wgeo.vertices[vxs.length + dp[j][1]];
        sidepoints.push([botpoint1[thisaxis], botpoint1.z]);
        sidepoints.push([botpoint2[thisaxis], botpoint2.z]);

        sidepoints = [].concat.apply([], sidepoints);
        var triangles = earcut(sidepoints);
        var finaltriangleindex = [];
        //debugger;
        for (var g = 0; g < triangles.length; g++) {
            finaltriangleindex[g] = wl[triangles[g]] || vxs.length + (triangles[g] - wl.length);
        }
        finaltriangleindex = createGroupedArray(finaltriangleindex, 3);
        for (var h = 0; h < finaltriangleindex.length; h++) {
            var mvert = wgeo.vertices;
            var tri = finaltriangleindex[h];
            //wgeo.faces.push(new THREE.Face3(tri[0], tri[1], tri[2]));
        }

    }
    for (var t = 0; t < tria.length; t++) {
        var f = tria[t];
        wgeo.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }
    //debugger;
    return wgeo;

};

function M_To_Object(geom) {
    debugger;
    cancelAnimationFrame(aniid);
    var rot = 0;
    if (terra !== null) {
        rot = pivot.rotation.y;
    }
    scene.remove(terra);
    scene.remove(pivot);

    terra = null;
    terra = new THREE.Mesh(geom, tmat);
    scene.add(terra);
    pivot = new THREE.Object3D();
    pivot.add(terra);
    scene.add(pivot);
    terra.position.x = 1;
    terra.position.z = 1;
    terra.rotation.x = Math.radians(90);
    pivot.rotation.y = rot;
    render();
    timet = 0;
}

function meshtogeo() {
    //debugger;
    var mesh = generateGoodMesh(defpoints, defextent);
    var vmesh = zero(mesh);
    termesh = vmesh;
    var meshtri = Delaunay.triangulate(vmesh.mesh.vxs);
    var meshind = {
        N: [],
        W: [],
        E: [],
        S: []
    };
    for (var i = 0; i < vmesh.mesh.vxs.length; i++) {
        //debugger;
        var vert = vmesh.mesh.vxs[i];
        if (vert[1] <= 0) {
            meshind.N.push(i);
        }
        if (vert[0] <= 0) {
            meshind.W.push(i);
        }
        if (vert[0] >= vmesh.mesh.extent.width) {
            meshind.E.push(i);
        }
        if (vert[1] >= vmesh.mesh.extent.height) {
            meshind.S.push(i);
        }
    }
    var dp = [
        [1, 0],
        [3, 0],
        [2, 1],
        [2, 3]
    ];
    meshtri = createGroupedArray(meshtri, 3);
    tergeo = Geo_Write(vmesh, meshtri, meshind, dp);
    debugger;
    M_To_Object(tergeo);
}


function addcone(workmesh, strength) {
    var mesh = workmesh
    debugger;
    var nmesh = add(mountains(mesh.mesh, 50),cone(mesh.mesh,-0.5));
    updateTerra(nmesh, tergeo);
}



var geomesh;
//console.log(geom.mesh.vxs);
//console.log(geotris);
var text2 = document.createElement('div');
text2.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
text2.style.width = 100;
text2.style.height = 100;

//debugger;
var edge_index = [
    [],
    [],
    [],
    []
];
var edge_points = [
    [],
    [],
    [],
    []
];

function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 2;
    camera.position.y = 1;
    camera.rotation.x = Math.radians(-45);
    // debugger;
    var hlight = new THREE.DirectionalLight(0xB58D3C, 1);
    hlight.position.y = 4;
    scene.add(hlight);
    matshaders();
    //meshtogeo();
    var wgeo = new THREE.CubeGeometry(3, 3, 3);
    water = new THREE.Mesh(wgeo, wmat);
    scene.add(water);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x9ae0fe);
    //terra.rotation.x = Math.radians(90);
    water.rotation.x = Math.radians(90);
    water.position.z = 0;
    water.position.y = -1.51;
    //water.rotation.x = -130;
    //water.position.y = 0.1;
    window.scene = scene;
    window.THREE = THREE;
    Frun = false;
    render();

}
init();

function render() {
        timet++;
    // text2.innerHTML = cube.rotation.z + ',' + circleColor + ',' + locH + ',' + locV + ',' + outnum + ',' + bbyte;
    text2.style.top = 60 + 'px';
    text2.style.left = 200 + 'px';
    document.body.appendChild(text2);
    //debugger;
    aniid = requestAnimationFrame(render);
    //timet += 0.5;
    //camera.rotation.x -= 0.001*Math.PI;
    water.rotation.z += 0.002;
    if (pivot !== null) {
        pivot.rotation.y -= 0.002;
    }
    //debugger;
    renderer.render(scene, camera);
}

function updateTerra(mesh, geo) {
    termesh = mesh;
    var workinggeo = geo;
    for (var d = 0; d < mesh.length; d++) {
        workinggeo.vertices[d].z = (-mesh[d] * 0.1);
    }
    workinggeo.verticesNeedUpdate = true;
    M_To_Object(workinggeo);
}


function rerender() {

    camera.position.z = 1;
    camera.position.y = 1;
    camera.rotation.x = Math.radians(-45);
    // debugger;
    var geometry = null;
    geometry = new THREE.Geometry();
    var gvxs = geom.mesh.vxs;
    for (var i = 0; i < geom.length; i++) {
        var h = geom[i];
        //h = Math.max(Math.min(h, 0.1), -0.1);
        //console.log(h);
        geometry.vertices.push(new THREE.Vector3(gvxs[i][0] - 1, gvxs[i][1] - 1, h));
    }
    for (var j = 0; j < geotris.length; j++) {
        var t = geotris[j];
        geometry.faces.push(new THREE.Face3(t[0], t[1], t[2]));
    }
    //renderer.setClearColorHex(0x333F47, 1);
    //material = null;
    /*material = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
        shading: THREE.FlatShading,
        //side: THREE.DoubleSide,
        shininess: 0,
        specular: 0x000000
    });*/
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.rotation.x = Math.radians(90);

    water.rotation.z = 0;
    //water.rotation.x = -130;
    //water.position.y = 0.1;
    render();
}
var ggui = new dat.GUI({
    height: 5 * 32 - 1,
});
var guifunc = {
    new: function() {
        meshtogeo();
    },
    cone: function() {
        addcone(termesh, 0.5);
    }
};
ggui.add(guifunc, 'new');
ggui.add(guifunc, 'cone');
