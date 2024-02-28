import { Polyline } from "./Polyline.js";
import { Transform } from "./Transform.js";
import { Point, Vector } from "./XYZ.js";
import * as THREE from 'three';

export default class Arc {
    Centre;
    Radius;
    Angle;
    #StartPt;
    IsClockwise;
    /**
     * 
     * @param {Point} Centre 
     * @param {number} Radius 
     * @param {number[]} Angle 
     */
    constructor(Centre = new Point(0, 0, 0), Radius = 5, Angle = [0, Math.PI / 2]) {
        this.Centre = Centre;
        this.Radius = Radius;
        this.Angle = Angle.length === 2 ? Angle : [0, Math.PI / 2];
        this.#StartPt = Centre.ClonePt();
        this.#StartPt.x += Radius;
        this.#StartPt = this.#StartPt.Transform(Transform.Rotate(Angle[0], this.Centre, Vector.ZAxis));
        this.IsClockwise = this.Angle[0] > this.Angle[1];
    }
    GetLength() {
        return this.Radius * 2 * PI * (Math.abs(this.Angle[1] - this.Angle[0]) / 2 * Math.PI);
    }
    /**
     * 
     * @param {number} t 
     * @returns Point
     */
    PointOnArc(t) {
        if (t === 0) {
            return this.#StartPt;
        }
        else if (t === this.GetLength() || t > this.GetLength()) {
            let EndPt = this.#StartPt.ClonePt();
            let AngleDiff = this.Angle[1] - this.Angle[0];
            EndPt = EndPt.Transform(Transform.Rotate(AngleDiff, this.Centre, Vector.ZAxis));
            return EndPt;
        }
        else {
            let rad = t / this.GetLength();
            let AngleDiff = this.Angle[1] - this.Angle[0];
            let ResetAng = this.Angle[0] + AngleDiff * rad;
            let EndPt = this.#StartPt.ClonePt().Transform(Transform.Rotate(ResetAng, this.Centre, Vector.ZAxis));
            return EndPt;
        }
    }
    Reverse() {
        this.IsClockwise = !this.IsClockwise;
        let temp = this.Angle[0];
        this.Angle[0] = this.Angle[1];
        this.Angle[1] = temp;
    }
    /**
     * 
     * @param {Transform} MTS 
     * @returns Arc
     */
    Transform(MTS) {
        let Centre = this.Centre.ClonePt().Transform(MTS);
        let NewStartPt = this.#StartPt.ClonePt().Transform(MTS);
        let CenToNewSt = Vector.CreateFromTwoPoint(Centre, NewStartPt);
        let AngleDiff = Vector.Angle(Vector.XAxis, CenToNewSt);
        let Angle = this.Angle;
        Angle[0] += AngleDiff;
        Angle[1] += AngleDiff;
        return new Arc(Centre, this.Radius, Angle);
    }
    RotateFromCentre(Angle) {
        this.Angle[0] += Angle;
        this.Angle[1] += Angle;
    }
    /**
     * 
     * @param {Point} Centre 
     * @param {Point} StartPoint 
     * @param {Point} EndPoint 
     * @param {Boolean} IsClockwise 
     */
    static CreateArcWithThreePts(Centre, StartPoint, EndPoint, IsClockwise = true) {
        let StToCen = Vector.CreateFromTwoPoint(Centre, StartPoint);
        let EdToCen = Vector.CreateFromTwoPoint(Centre, EndPoint);

        const Radius = StToCen.length();
        let AngleXandSt = Vector.Angle(Vector.XAxis, StToCen);
        let AngleXandEd = Vector.Angle(Vector.XAxis, EdToCen);
        const Angle = AngleXandSt < AngleXandEd ? [AngleXandSt, AngleXandEd] : [AngleXandEd, AngleXandSt];
        if (!IsClockwise) {
            Angle = Angle.reverse()
        }
        return new Arc(Centre, Radius, Angle);
    }

    static AddArcInstance(Scene, Arc, Segments = 12, colour = 0xffffff, linewidth = 2) {
        let Pts = [];
        Segments = Segments < 3 ? 12 : Segments;
        let angledifference;

        if (Arc.IsClockwise) {
            // Determine the orientation of the arc (clockwise or counterclockwise)
            let angleDiff = Arc.Angle[0] - Arc.Angle[1];
            let isClockwise = angleDiff > Math.PI;

            // Calculate the start and end angles
            let startAngle = Arc.Angle[0];
            let endAngle = Arc.Angle[1] + 2 * Math.PI;

            // Calculate the angle difference
            angledifference = (endAngle - startAngle) / Segments;

            // Add points to the array

            for (let i = 0; i <= Segments; i++) {
                let angle = startAngle + angledifference * i;
                let Spin = Transform.Rotate(angle, Arc.Centre, Vector.ZAxis);
                Pts.push(Arc.#StartPt.Transform(Spin));
            }
        } else {
            // Calculate the angle difference
            angledifference = (Arc.Angle[1] - Arc.Angle[0]) / Segments;

            // Add points to the array
            for (let i = 0; i <= Segments; i++) {
                let angle = Arc.Angle[0] + angledifference * i;
                let Spin = Transform.Rotate(angle, Arc.Centre, Vector.ZAxis);
                Pts.push(Arc.#StartPt.Transform(Spin));
            }
        }

        // Create and add the polyline instance to the scene
        let PL = new Polyline(Pts);
        Polyline.AddPolylineInstance(Scene, PL, colour, linewidth);
    }

}