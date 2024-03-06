import { Point, Vector } from './XYZ.js'
import { Transform } from './Transform.js';
import * as THREE from 'three'

class Line {
    StartPoint;
    EndPoint;
    MidPoint;
    Tangent;
    #THREEline = null;
    Length;
    #MidPoint() {
        let x = (this.StartPoint.x + this.EndPoint.x) / 2;
        let y = (this.StartPoint.y + this.EndPoint.y) / 2;
        let z = (this.StartPoint.z + this.EndPoint.z) / 2;
        return new Point(x, y, z);
    }
    /**
     * 
     * @param {Point} StartPoint 
     * @param {Point} EndPoint 
     */
    constructor(StartPoint = new Point(0, 0, 0), EndPoint = new Point(10, 0, 0)) {
        this.StartPoint = StartPoint;
        this.EndPoint = EndPoint;
        this.Tangent = Vector.CreateFromTwoPoint(StartPoint, EndPoint);
        this.Tangent = this.Tangent.Normalise();
        this.MidPoint = this.#MidPoint();
        this.Length = StartPoint.DistTo(EndPoint);
    }
    /**
     * Test wether the point is on the line
     * @param {Point} TestPoint 
     * @returns {number} if -1, the point doesn't located on the line, or return the t parameter of the line.
     */
    IsPointOnLine(TestPoint) {
        let Vec1 = Vector.CreateFromTwoPoint(this.StartPoint, TestPoint);
        let Vec2 = Vector.CreateFromTwoPoint(TestPoint, this.EndPoint);
        let L1 = Vec1.length();
        if (Vec1.Normalise().Equal(Vec2.Normalise())) {
            return L1 / this.Length;
        }
        else {
            return -1;
        }
    }
    /**
     * 
     * @param {Point} TestPoint 
     * @returns 
     */
    VerticalPointOnLine(TestPoint) {
        if (this.IsPointOnLine(TestPoint) != -1) {
            return TestPoint;
        }
        else {
            let Ax = this.EndPoint.x - this.StartPoint.x;
            let Ay = this.EndPoint.y - this.StartPoint.y;
            let Az = this.EndPoint.z - this.StartPoint.z;
            let n = (
                Ax * (TestPoint.x - this.EndPoint.x) +
                Ay * (TestPoint.y - this.EndPoint.y) +
                Az * (TestPoint.z - this.EndPoint.z)) /
                (
                    Ax * Ax + Ay * Ay + Az * Az
                )

            let newPt =
                new Point(this.EndPoint.x + Ax * n, this.EndPoint.y + Ay * n, this.EndPoint.z + Az * n)
            return newPt;
        }
    }

    ClosetPointOnLine(TestPoint) {
        if (this.IsPointOnLine(TestPoint) != -1) {
            return TestPoint;
        }
        else {
            let VerPt = this.VerticalPointOnLine(TestPoint);
            if (this.IsPointOnLine(VerPt)) {
                return VerPt;
            }
            else {
                if (VerPt.DistTo(this.EndPoint) < VerPt.DistTo(this.StartPoint)) {
                    return this.EndPoint;
                }
                else {
                    return this.StartPoint;
                }
            }
        }
    }

    /**
     * 
     * @param {THREE.Scene} Scene 
     * @param {Line} line 
     * @param {color} colour
     * @param {number} linewidth
     */
    static AddLineInstance(Scene, line, colour, linewidth) {
        const LineGeometry = new THREE.BufferGeometry().setFromPoints([
            Point.ToTHREEVector3(line.StartPoint),
            Point.ToTHREEVector3(line.EndPoint)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: colour, linewidth: linewidth
        });
        const THREEline = new THREE.Line(LineGeometry, lineMaterial);
        Scene.add(THREEline);
    }
    /**
     * 
     * @param {color} colour 
     * @param {number} linewidth 
     * @returns 
     */
    ComputeTHREELine(colour, linewidth) {
        if (this.THREEline === null) {
            const LineGeometry = new THREE.BufferGeometry().setFromPoints([
                Point.ToTHREEVector3(line.StartPoint),
                Point.ToTHREEVector3(line.EndPoint)
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: colour, linewidth: linewidth
            });
            this.THREEline = new THREE.Line(LineGeometry, lineMaterial);
            return this.THREEline;
        }
        else {
            return this.THREEline;
        }
    }
    Transform(TS) {
        this.StartPoint = this.StartPoint.Transform(TS);
        this.EndPoint = this.EndPoint.Transform(TS);

        return new Line(this.StartPoint, this.EndPoint);
    }
    ExtendLine(StartEx = 0, EndEx = 0) {
        this.StartPoint = this.StartPoint.Translate(this.Tangent.Clone().Multiple(-StartEx));
        this.EndPoint = this.EndPoint.Translate(this.Tangent.Clone().Multiple(EndEx));
        return new Line(this.StartPoint, this.EndPoint);
    }

}


export { Line }