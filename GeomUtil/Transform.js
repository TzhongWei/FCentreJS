import { Vector, Point } from './XYZ.js'

class Transform {
    #Matrix;
    constructor() {
        this.#Matrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    }
    static Identity() {
        const result = new Transform();
        result.#Matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
        return result;
    }
    GetMatrix() {
        return this.#Matrix.flat();
    }
    /**
     * Set up a translation transformation
     * @param {Vector} Vector 
     */
    static Translate(Vector) {
        const result = new Transform();
        result.#Matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [Vector.x, Vector.y, Vector.z, 1]];
        return result;
    }
    /**
     * X is an angle not a degree
     * @param {number} x 
     */
    static RotateX(x) {
        const result = new Transform();
        result.#Matrix = [
            [1, 0, 0, 0],
            [0, Math.cos(x), -Math.sin(x), 0],
            [0, Math.sin(x), Math.cos(x), 0],
            [0, 0, 0, 1]
        ];
        return result;
    }
    /**
     * Rotate around the Y-axis.
     * @param {number} y - Angle
     * @returns {Transform} - Resulting transformation.
     */
    static RotateY(y) {
        const result = new Transform();
        result.#Matrix = [
            [Math.cos(x), 0, -Math.sin(x), 0],
            [0, 1, 0, 0],
            [Math.sin(x), 0, Math.cos(x), 0],
            [0, 0, 0, 1]
        ];
        return result;
    }
    /**
     * Rotate around the Z-axis.
     * @param {number} z - Angle
     * @returns {Transform} - Resulting transformation.
     */
    static RotateZ(z) {
        const result = new Transform();
        result.#Matrix = [
            [Math.cos(x), -Math.sin(x), 0, 0],
            [Math.sin(x), Math.cos(x), 0, 0],
            [0, 0, 1, 0]
            [0, 0, 0, 1]
        ];
        return result;
    }
    /**
     * Scale transformation.
     * @param {number} x - Scaling factor along the X-axis.
     * @param {number} y - Scaling factor along the Y-axis.
     * @param {number} z - Scaling factor along the Z-axis.
     * @returns {Transform} - Resulting transformation.
     */
    static Scale(x, y, z) {
        const result = new Transform();
        result.#Matrix = [
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]
        ];
        return result;
    }
    /**
     * Scale transformation with respect to a specified point.
     * @param {number} x - Scaling factor along the X-axis.
     * @param {number} y - Scaling factor along the Y-axis.
     * @param {number} z - Scaling factor along the Z-axis.
     * @param {Point} point - Point to scale from.
     * @returns {Transform} - Resulting transformation.
     */
    static ScaleFromPoint(x, y, z, Point) {
        const Vec1 = Vector.CreateFromPoint(Point);
        return Transform.Translate(Vec1.Reverse())     //TST
            .Mutliply(Transform.Scale(x, y, z))
            .Mutliply(Transform.Translate(Vec1));
    }
    /**
    * Rotate a transformation around an axis by a specified angle.
    * @param {number} Angle - The angle of rotation in radians.
    * @param {Point} PointCentre - The center point of rotation.
    * @param {Vector} Axis - The axis of rotation.
    * @returns {Transform} - Resulting transformation.
     */
    static Rotate(Angle, PointCentre, Axis) {
        const result = new Transform();
        const cosA = Math.cos(Angle);
        const sinA = Math.sin(Angle);
        const oneMinusCosA = 1 - cosA;

        const ux = Axis.x;
        const uy = Axis.y;
        const uz = Axis.z;
        const Vec1 = Vector.CreateFromPoint(PointCentre);
        result.#Matrix = [
            [cosA + ux * ux * oneMinusCosA, ux * uy * oneMinusCosA - uz * sinA, ux * uz * oneMinusCosA + uy * sinA, 0],
            [uy * ux * oneMinusCosA + uz * sinA, cosA + uy * uy * oneMinusCosA, uy * uz * oneMinusCosA - ux * sinA, 0],
            [uz * ux * oneMinusCosA - uy * sinA, uz * uy * oneMinusCosA + ux * sinA, cosA + uz * uz * oneMinusCosA, 0],
            [0, 0, 0, 1]
        ];

        return Transform.Translate(Vec1.Reverse()).Mutliply(result).Mutliply(Transform.Translate(Vec1));
    }
    /**
     * Generate a projection transform along the Axis until the Point Centre
     * @param {Vector} Axis 
     * @param {Point} PointCentre 
     */
    static Project(Axis, PointCentre) {
        const result = new Transform();
        const normaliseAxis = Axis.Normalise();
        const dotProduct = Vector.CreateFromPoint(PointCentre).DotProduct(normaliseAxis);

        result.#Matrix = [
            [1 - normalizedAxis.x * normalizedAxis.x, -normalizedAxis.x * normalizedAxis.y, -normalizedAxis.x * normalizedAxis.z, normalizedAxis.x * dotProduct],
            [-normalizedAxis.y * normalizedAxis.x, 1 - normalizedAxis.y * normalizedAxis.y, -normalizedAxis.y * normalizedAxis.z, normalizedAxis.y * dotProduct],
            [-normalizedAxis.z * normalizedAxis.x, -normalizedAxis.z * normalizedAxis.y, 1 - normalizedAxis.z * normalizedAxis.z, normalizedAxis.z * dotProduct],
            [0, 0, 0, 1]
        ];
        return result;
    }
    /**
     * 
     * @param {Transform} TS 
     */
    static IsIdentity(TS) {
        return Transform.Identity().#Matrix === TS.#Matrix;
    }
    /**
     * Test if the transformation is zero
     * @param {Transform} TS 
     * @return {boolean} 
     */
    static IsZero(TS) {
        let test = true;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                test &= TS.#Matrix[i][j] === 0;
            }
        }
        if (test) return true;
        else return false;
    }
    /**
     * Multiply this transformation by another transformation.
     * @param {Transform} TSM - Transformation to multiply with.
     * @returns {Transform} - Resulting transformation.
     */
    Mutliply(TSM) {
        const result = new Transform();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    result.#Matrix[i][j] += this.#Matrix[i][k] * TSM.#Matrix[k][j];
                }
            }
        }
        return result;
    }
}

export { Transform };