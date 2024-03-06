import * as THREE from 'three'
import rhino3dm from 'rhino3dm'
import { Transform } from './Transform.js';
import { Line } from './Line.js'

class Point {
    x; y; z;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * A a set of points into a point
     * @param  {...Point} points 
     * @returns 
     */
    Add(...points) {
        for (let pt of points) {
            this.x += pt.x;
            this.y += pt.y;
            this.z += pt.z;
        }
        return this;
    }
    /**
     * translate a point with a vector
     * @param {Vector} vector translation vector
     * @return a point
     */
    Translate(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }
    ClonePt() {
        return new Point(this.x, this.y, this.z);
    }
    DistTo(Point) {
        return Math.sqrt(
            Math.pow((this.x - Point.x), 2) +
            Math.pow((this.y - Point.y), 2) +
            Math.pow((this.z - Point.z), 2)

        )
    }
    /**
     * 
     * @param {THREE.Scene} Scene 
     * @param {Point} Point Point
     * @param {number} Size Number
     * @param {color} Colour color
     */
    static AddPointInstance(Scene, Point, Size = 2, Colour = 0xffffff) {
        const PointGeomtry = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(Point.x, Point.y, Point.z)]);
        const PointMaterial = new THREE.PointsMaterial({ color: Colour, size: Size });
        const THREEPt = new THREE.Points(PointGeomtry, PointMaterial);
        Scene.add(THREEPt);

    }
    static IsColinear(...args) {
        if (args.length < 3) {
            return false;
        }

        for (const i = 2; i < args.length; i++) {
            let Xratio = (args[0].x - args[1].x) / (args[0].x - args[i].x)
            let Yratio = (args[0].y - args[1].y) / (args[0].y - args[i].y)
            let Zratio = (args[0].z - args[1].z) / (args[0].z - args[i].z)
            if (Xratio != Yratio && Yratio != Zratio) {
                return false;
            }
        }
        return true;
    }
    static Origin = new Point(0, 0, 0);
    /**
     * 
     * @param {Point} Point 
     * @returns THREE.Vector3
     */
    static ToTHREEVector3(Point) {
        return new THREE.Vector3(Point.x, Point.y, Point.z);
    }
    Transform(MTS) {
        const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = MTS.GetMatrix();
        // Represent the vector as a 4D homogeneous coordinate
        const homogeneousVector = [this.x, this.y, this.z, 1];
        // Perform matrix-vector multiplication
        const transformedVector = [
            a * homogeneousVector[0] + e * homogeneousVector[1] + i * homogeneousVector[2] + m * homogeneousVector[3],
            b * homogeneousVector[0] + f * homogeneousVector[1] + j * homogeneousVector[2] + n * homogeneousVector[3],
            c * homogeneousVector[0] + g * homogeneousVector[1] + k * homogeneousVector[2] + o * homogeneousVector[3],
        ];

        // Update the vector's coordinates
        let x = transformedVector[0];
        let y = transformedVector[1];
        let z = transformedVector[2];
        return new Point(x, y, z);
    }
    /**
     * 
     * @param {Point} OtherPoint 
     */
    Equal(OtherPoint) {
        return this.x === OtherPoint.x && this.y === OtherPoint.y && this.z === OtherPoint.z;
    }
}

class Vector {
    x; y; z;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static XAxis = new Vector(1, 0, 0);
    static YAxis = new Vector(0, 1, 0);
    static ZAxis = new Vector(0, 0, 1);

    static Angle(Vector1, Vector2) {
        let Doc = Vector.DotProduct(Vector1, Vector2);
        let Mag1 = Vector.Magnitude(Vector1);
        let Mag2 = Vector.Magnitude(Vector2);
        let consine = Doc / (Mag1 * Mag2);
        return Math.acos(consine);
    }
    /**
     * 
     * @param {Point} Point input point
     * @returns output a vector
     */
    static CreateFromPoint(Point) {
        return new Vector(Point.x, Point.y, Point.z);
    }
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }
    /**
     * @returns unitise a vector
     */
    Normalise() {
        const Unit = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        let x = this.x / Unit;
        let y = this.y / Unit;
        let z = this.z / Unit;
        return new Vector(x, y, z);
    }
    /**
     * create a vector with two points
     * @param {Point} from start point
     * @param {Point} to end point
     * @returns a new vector
     */
    static CreateFromTwoPoint(from, to) {
        return new this(to.x - from.x, to.y - from.y, to.z - from.z);
    }
    /**
     * 
     * @param {number} size 
     * @returns this Vector
     */
    Multiple(size) {
        this.x *= size;
        this.y *= size;
        this.z *= size;
        return this;
    }
    /**
     * 
     * @param {Point} Other 
     * @returns this Vector
     */
    Add(Other) {
        this.x += Other.x;
        this.y += Other.y;
        this.z += Other.z;
        return this;
    }
    /**
     * Reverse vector
     * @returns Vector
     */
    Reverse() {
        let x = -this.x;
        let y = -this.y;
        let z = -this.z;
        return new Vector(x, y, z);
    }
    Clone() {
        return new Vector(this.x, this.y, this.z);
    }
    /**
     * 
     * @param {number} Angle 
     * @param {Vector} Axis 
     * @returns 
     */
    Rotate(Angle, Axis) {
        this.Transform(Transform.Rotate(Angle, Point.Origin, Axis));
        return new Vector(this.x, this.y, this.z);
    }
    /**
     * 
     * @param {Transform} MTS 
     */
    Transform(MTS) {
        const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = MTS.GetMatrix();

        // Represent the vector as a 4D homogeneous coordinate
        const homogeneousVector = [this.x, this.y, this.z, 1];

        // Perform matrix-vector multiplication
        const transformedVector = [
            a * homogeneousVector[0] + e * homogeneousVector[1] + i * homogeneousVector[2] + m * homogeneousVector[3],
            b * homogeneousVector[0] + f * homogeneousVector[1] + j * homogeneousVector[2] + n * homogeneousVector[3],
            c * homogeneousVector[0] + g * homogeneousVector[1] + k * homogeneousVector[2] + o * homogeneousVector[3],
        ];

        // Update the vector's coordinates
        let x = transformedVector[0];
        let y = transformedVector[1];
        let z = transformedVector[2];
        return new Vector(x, y, z);
    }
    /**
     * 
     * @param {Vector} Vector1 
     * @param {Vector} Vector2 
     * @returns Dot product from two vectors
     */
    static DotProduct(Vector1, Vector2) {
        return Vector1.x * Vector2.x + Vector1.y * Vector2.y + Vector1.z * Vector2.z;
    }
    static CrossProduct(Vector1, Vector2) {
        const resultX = Vector1.y * Vector2.z - Vector1.z * Vector2.y;
        const resultY = Vector1.z * Vector2.x - Vector1.x * Vector2.z;
        const resultZ = Vector1.x * Vector2.y - Vector1.y * Vector2.x;

        return new Vector(resultX, resultY, resultZ);
    }
    static Magnitude(Vector) {
        return Math.sqrt(Vector.x ** 2 + Vector.y ** 2 + Vector.z ** 2);
    }
    /**
     * 
     * @param {Point} Anchor 
     * @param {Vector} Vec 
     */
    static DisplayVector(Scene, Anchor, Vec) {
        const EndPt = Anchor.ClonePt().Translate(Vec);
        const line = new Line(Anchor, EndPt);
        Line.AddLineInstance(Scene, line, 0xffffff, 5);
        Point.AddPointInstance(Scene, EndPt, 0.2, 0x0078ff);
    }

    /**
     * 
     * @param {Vector} OtherVector 
     * @returns {boolean} Test if the vector is the same
     */
    Equal(OtherVector) {
        return this.x === OtherVector.x && this.y === OtherVector.y && this.z === OtherVector.z;
    }
}

class Plane {
    XAxis;
    YAxis;
    ZAxis;
    Origin;
    constructor(XAxis = Vector.XAxis, YAxis = Vector.YAxis, Origin = Point.Origin) {
        this.XAxis = XAxis;
        this.YAxis = YAxis;
        this.ZAxis = Vector.CrossProduct(XAxis, YAxis);
        this.Origin = Origin;
    }
    WorldXYPlane = new Plane(Vector.XAxis, Vector.YAxis, Point.Origin);
    WorldYZPlane = new Plane(Vector.YAxis, Vector.ZAxis, Point.Origin);
    WorldXZPlane = new Plane(Vector.XAxis, Vector.ZAxis, Point.Origin);

}


export { Vector, Point, Plane };