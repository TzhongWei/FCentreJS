import { LineSegments } from "three";
import { Line } from "./Line.js";
import { Transform } from "./Transform.js";
import { Point, Vector } from "./XYZ.js";
import * as THREE from 'three';

export class Polyline {
    Vertices = [];
    /**
     * 
     * @param {Point[]} Vertices 
     */
    constructor(Vertices) {
        this.Vertices = Vertices;
    }
    GetLength() {
        let TotalLength = 0;
        let FirstPt = this.Vertices[0];
        let SecondPt = this.Vertices[1];
        for (let i = 1; i < this.Vertices.length - 1; i++) {
            TotalLength += FirstPt.DistTo(SecondPt);
            FirstPt = this.Vertices[i];
            SecondPt = this.Vertices[i + 1];
        }
        return TotalLength;
    }
    IsClosed() {
        if (this.Vertices[0].Equal(this.Vertices[this.Vertices.length - 1])) {
            return true;
        }
        else return false;
    }
    TryMakeClosed() {
        if (this.IsClosed()) {
            return false;
        }
        else {
            this.Vertices.push(this.Vertices[this.Vertices.length - 1]);
        }
    }
    GetSegment() {
        let LNs = [];
        let FirstPt = this.Vertices[0];
        for (let i = 1; i < this.Vertices.length; i++) {
            LNs.push(new Line(FirstPt, this.Vertices[i]));
            FirstPt = this.Vertices[i];
        }
        return LNs;
    }
    /**
     * 
     * @param {THREE.Scene} Scene 
     * @param {Polyline} Polyline 
     * @param {color} colour 
     * @param {number} linewidth 
     */
    static AddPolylineInstance(Scene, Polyline, colour, linewidth) {
        let Pts = [];
        for (let pt of Polyline.Vertices) {
            Pts.push(Point.ToTHREEVector3(pt));
        }
        const PolylineGeom = new THREE.BufferGeometry().setFromPoints(Pts);
        const lineMaterial = new THREE.LineBasicMaterial({ color: colour, linewidth: linewidth });
        const THREEPolyline = new THREE.Line(PolylineGeom, lineMaterial);
        Scene.add(THREEPolyline);
    }
    /**
     * Get a point on the polyline curve with t ranging 0 to the length of the polyline
     * @param {number} t 
     */
    PointOnPolyline(t) {
        let FirstPt = this.Vertices[0];
        let tValue = t;
        let FinalPoint;
        for (let i = 0; i < this.Vertices.length; i++) {
            let Length = FirstPt.DistTo(this.Vertices[i]);
            if (Length < tValue) {
                tValue -= Length;
                FirstPt = this.Vertices[i];
            }
            else {
                let Vec = Vector.CreateFromTwoPoint(FirstPt, this.Vertices[i]);
                Vec = Vec.Normalise().Multiple(tValue);
                FinalPoint = FirstPt.Translate(Vec);
                break;
            }
        }
        return FinalPoint;
    }
    NormalOnPolyline(t) {
        let FirstPt = this.Vertices[0];
        let tValue = t;
        let FinalPoint;
        for (let i = 0; i < this.Vertices.length; i++) {
            let Length = FirstPt.DistTo(this.Vertices[i]);
            if (Length < tValue) {
                tValue -= Length;
                FirstPt = this.Vertices[i];
            }
            else {
                let Vec = Vector.CreateFromTwoPoint(FirstPt, this.Vertices[i]);
                FinalPoint = Vec.Normalise();
                break;
            }
        }
        return FinalPoint;
    }
    GetDomain() {
        return [0, this.GetLength()];
    }
}











