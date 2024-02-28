import * as THREE from 'three';
import { Vector, Point, Plane } from '../GeomUtil/XYZ.js';
import { Transform } from '../GeomUtil/Transform.js';
import { TextStyle } from './TextStyle.js';

export default class TextBoard {
    Canvas;
    Text;
    Style;
    Location;
    #context;
    CanvasMaterial;
    SizeX;
    SizeY;
    #TextPlane;
    constructor(InputText, Width = 256, Height = 128, Style = TextStyle.DefaultStyle(), Location = Point.Origin) {
        this.Canvas = document.createElement('canvas');
        this.#context = this.Canvas.getContext('2d');
        this.Canvas.width = Width;
        this.Canvas.height = Height;
        this.Text = InputText;
        this.Style = Style;
        this.Location = Location;
        this.#SetContext();
        this.SizeX = 1;
        this.SizeY = 0.5;
        this.#TextPlane = new THREE.PlaneGeometry(this.SizeX, this.SizeY);
    }
    SetSize(SizeX, SizeY) {
        this.SizeX = SizeX;
        this.SizeY = SizeY;
        this.#TextPlane = new THREE.PlaneGeometry(this.SizeX, this.SizeY);
    }
    SetLocation(x, y, z) {
        const NewPt = new Point(x, y, z);
        this.Location = NewPt;
    }
    #SetContext() {
        this.#context.font = this.Style.parameters.px + " " + this.Style.parameters.fontfamily;
        this.#context.fillStyle = this.Style.parameters.textcolour;
        this.#context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        this.#context.fillText(this.Text, this.Canvas.width / 2 - this.Text.length * 6, this.Canvas.height / 2);
        const texture = new THREE.CanvasTexture(this.Canvas);
        this.CanvasMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    }

    static AddInstanceBoard(scene, Board) {
        const mesh = new THREE.Mesh(Board.#TextPlane, Board.CanvasMaterial);
        mesh.position.set(Board.Location.x, Board.Location.y, Board.Location.z);
        scene.add(mesh);
    }
}


