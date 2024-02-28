import { Point, Vector } from "../GeomUtil/XYZ.js";
import { Transform } from "./Transform.js";
import * as THREE from 'three'
import { Polyline } from "./Polyline.js"

export default class Circle {
    Centre;
    Radius;
    #PointOnCircle
    /**
     * 
     * @param {Point} Centre 
     * @param {number} Radius 
     */
    constructor(Centre, Radius) {
        this.Centre = Centre;
        this.Radius = Radius;
        let TempPt = Centre.ClonePt();
        TempPt.x += Radius;
        this.#PointOnCircle = TempPt;
    }
    /**
     * 
     * @param {Point} Centre 
     * @param {Point} SecondPt 
     * @returns 
     */
    static CreateCircleWithTwoPoint(Centre, SecondPt) {
        return new Circle(Centre, Centre.DistTo(SecondPt));
    }
    /**
     * 
     * @param {Transform} TS 
     * @returns Circle
     */
    Transform(TS) {
        let Centre = this.Centre.Transform(TS);
        return new Circle(Centre, this.Radius);
    }
    static AddCircleInstance(Scene, Circle, Segments = 24, Colour = 0xffffff, LineWidth = 2) {
        Segments = Segments < 3 ? 12 : Segments;
        let Pts = []
        Pts.push(Circle.#PointOnCircle);
        for (let i = 1; i <= Segments; i++) {
            let Spin = Transform.Rotate(Math.PI * 2 / Segments * i, Circle.Centre, Vector.ZAxis);
            Pts.push(Circle.#PointOnCircle.Transform(Spin));
        }
        let PL = new Polyline(Pts);
        Polyline.AddPolylineInstance(Scene, PL, Colour, LineWidth);
    }
}