// #region IMPORTS //
// This script is only for rhino viewer

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import rhino3dm from 'rhino3dm'
import { Transform } from './GeomUtil/Transform.js'
import { Vector, Point } from './GeomUtil/XYZ.js'
import { Line } from './GeomUtil/Line.js'
import Circle from './GeomUtil/Circle.js'
import Arc from './GeomUtil/Arc.js';
import TextBoard from './Dimension/TextBoard.js'

// #endregion IMPORTS //

// #region GLOBALS //

const loader = new Rhino3dmLoader()
loader.setLibraryPath('https://unpkg.com/rhino3dm@7.15.0/')

const upload = document.getElementById("file-upload")

let renderer, scene, camera, controls
const material = new THREE.MeshNormalMaterial()

let rhino, RhinoDoc

// #endregion GLOBALS //

// #region EVENTS //

upload.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        showSpinner(true)
        const file = this.files[0]
        if (file.name.endsWith('.3dm')) {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.addEventListener('load', function (e) {
                const arr = new Uint8Array(e.target.result).buffer
                //Rhino3dm disposes
                rhino3dm().then(async m => {
                    console.log("loaded rhino3dm")
                    rhino = m
                    RhinoDoc = rhino.File3dm.fromByteArray(arr);
                    if (RhinoDoc != null) {
                        console.log("loaded successfully")

                        let obj = RhinoDoc.objects()
                        console.log(obj)

                        let DocFiles = []
                        let DocAtts = []
                        for (let i = 0; i < obj.count; i++) {
                            DocFiles.push(obj.get(i).geometry())
                            DocAtts.push(obj.get(i).attributes())
                        }
                        console.log(DocFiles)
                        console.log(DocAtts)
                    }
                    else {
                        console.log("failed")
                    }
                })
                loader.parse(arr, (object) => {

                    // hide spinner
                    showSpinner(false)
                    console.log(object)

                    //clear objects from scene
                    scene.traverse(child => {
                        if (child.userData.hasOwnProperty('objectType') && child.userData.objectType === 'File3dm') {
                            scene.remove(child)
                        }
                    })
                    //add doc to scene
                    scene.add(object)

                    // zoom to extents
                    zoomCameraToSelection(camera, controls, [object])

                    //animate()
                }, (error) => {
                    console.log(error)
                })

            })

        }
    }
})

//DataDisposal test
function DataDisposal(Doc) {
    let obj = Doc.objects();
    let RhinoObjectTable = [];
    let layers = Doc.layers();
    let DocFiles = [];
    for (let i = 0; i < obj.count; i++) {
        DocFiles.push(obj.get(i));
    }
    console.log(DocFiles);
}

// #endregion EVENTS //

// #region INIT //

init()
animate()

function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)

    //renderer

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    //scene

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0.8, 0.8, 0.8)


    //camera

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 5)

    //controls
    controls = new OrbitControls(camera, renderer.domElement)


    const Board = new TextBoard("HI! Newboard");
    Board.SetLocation(5, 0, 0);
    TextBoard.AddInstanceBoard(scene, Board);

    //Test Geometry
    var arc = new Arc(new Point(0, 0, 0), 5);
    Arc.AddArcInstance(scene, arc);
    //Test region with Mesh canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const WidthSetting = 256 * 2;
    const HeightSetting = 128 * 2;
    canvas.width = WidthSetting;
    canvas.height = HeightSetting;

    // Draw text on the canvas
    context.font = '20px Arial';
    context.fillStyle = 'black';
    context.textAlign = "left";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText('Hello, THREE.js!', WidthSetting / 2, HeightSetting / 2);
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Create a material using the texture
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

    // Create a geometry for a simple plane
    const geometry = new THREE.PlaneGeometry(1, 0.5);
    //Erect the plane
    //geometry.rotateX(Math.PI * 0.5);

    // Create a mesh with the material and geometry
    const mesh = new THREE.Mesh(geometry, material);
    // Set the position of the mesh
    mesh.position.set(0, 0, 0);

    // Add the mesh to the scene
    scene.add(mesh);



    //End Test

    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
    directionalLight.position.set(0, 0, 1)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight2.position.set(0, 0, -10)
    scene.add(directionalLight2)

    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    scene.add(ambientLight)


    const GridHelper = new THREE.GridHelper(10);
    GridHelper.rotation.x = Math.PI * 0.5;
    scene.add(GridHelper)
    // const sphereGeo = new THREE.BoxGeometry(4, 4, 4)
    // const sphere = new THREE.Mesh(sphereGeo, new THREE.MeshNormalMaterial)
    // sphere.rotation.x = Math.sin(30);
    // scene.add(sphere)

    // handle changes in the window size
    window.addEventListener('resize', onWindowResize, false)

}

/**
 * 
 * @param {*} Scene 
 * @param {Line} line 
 * @param {*} colour 
 * @param {*} linewidth 
 */

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

// function to continuously render the scene
function animate() {

    requestAnimationFrame(animate)
    renderer.render(scene, camera)

}

// #endregion INIT //

// #region UTILITY //

/**
 * Shows or hides the loading spinner
 */
function showSpinner(enable) {
    if (enable)
        document.getElementById('loader').style.display = 'block'
    else
        document.getElementById('loader').style.display = 'none'
}


/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
function zoomCameraToSelection(camera, controls, selection, fitOffset = 1.1) {

    const box = new THREE.Box3();

    for (const object of selection) {
        if (object.isLight) continue
        box.expandByObject(object);
    }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = controls.target.clone()
        .sub(camera.position)
        .normalize()
        .multiplyScalar(distance);
    controls.maxDistance = distance * 10;
    controls.target.copy(center);

    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
    camera.position.copy(controls.target).sub(direction);

    controls.update();

}

// #endregion UTILITY //