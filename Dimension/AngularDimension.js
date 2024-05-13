import { Arc } from "../GeomUtil/Arc.js";
import { Line } from "../GeomUtil/Line.js";
import { Point, Vector } from "../GeomUtil/XYZ.js";
import { Transform } from "../GeomUtil/Transform.js";
import { TextStyle } from "./TextStyle.js";
import TextBoard from "./TextBoard.js";

class AngularDimension {
  Geoms;
  CenterPoint;
  DefPoint1;
  DefPoint2;
  /**
   * PointOnDim is a point determine the third point to set the dimension.
   * TextLocation is the actual point located on the Dimension Label.
   */
  PointOnDim;
  TextLocation;
  Content;
  Angle;
  Style;
  #TextAngle;
  #SetUp;
  constructor(
    CenterPoint = Point.Origin,
    DefPoint1 = new Point(5, 0, 0),
    DefPoint2 = new Point(0, 5, 0),
    PointOnDim = new Point(7.5, 7.5, 0),
    Style = TextStyle.DefaultStyle()
  ) {
    this.CenterPoint = CenterPoint;
    this.DefPoint1 = DefPoint1;
    this.DefPoint2 = DefPoint2;
    this.PointOnDim = PointOnDim;
    this.Style = Style;
    this.#SetUp = true;
    this.Geoms = {};
    var Def1Vec = Vector.CreateFromTwoPoint(CenterPoint, DefPoint1);
    Def1Vec = Def1Vec.Normalise();
    var Def2Vec = Vector.CreateFromTwoPoint(CenterPoint, DefPoint2);
    Def2Vec = Def2Vec.Normalise();
    this.Angle = (Vector.Angle(Def1Vec, Def2Vec) * 180) / Math.PI;
    this.Content = this.Angle.toString() + "°";
    if (Point.IsColinear(this.CenterPoint, this.DefPoint1, this.DefPoint2)) {
      console.log("The Points are colinear");
      this.#SetUp = false;
    }
    let DimDis = CenterPoint.DistTo(PointOnDim);
    Def1Vec = Def1Vec.Multiple(DimDis);
    Def2Vec = Def2Vec.Multiple(DimDis);
    this.#constructParaGeoms(Def1Vec, Def2Vec);
  }
  #constructParaGeoms(Def1Vec, Def2Vec) {
    let Mul = this.Style.parameters.DIMDist;
    const UnitVer1 = Def1Vec.Clone().Normalise().Multiple(Mul);
    const UnitVer2 = Def2Vec.Clone().Normalise().Multiple(Mul);
    const ShiftSt = this.DefPoint1.ClonePt().Translate(UnitVer1);
    const ShiftEd = this.DefPoint2.ClonePt().Translate(UnitVer2);
    const LabelSt = this.DefPoint1.ClonePt().Translate(Def1Vec);
    const LabelEd = this.DefPoint2.ClonePt().Translate(Def2Vec);

    const OutSt = LabelSt.ClonePt().Translate(UnitVer1);
    const OutEd = LabelEd.ClonePt().Translate(UnitVer2);

    const LNSt = new Line(ShiftSt, OutSt.ClonePt());
    const LNEd = new Line(ShiftEd, OutEd.ClonePt());

    const DIMArc = Arc.CreateArcWithThreePts(
      this.CenterPoint,
      OutSt,
      OutEd,
      false
    ).ExtendArc(Mul, Mul);
    console.log(DIMArc);
    const OutStRe = LabelSt.ClonePt().Translate(UnitVer1.Reverse());
    const OutEdRe = LabelEd.ClonePt().Translate(UnitVer2.Reverse());

    let LN1 = new Line(OutSt, OutStRe);
    let LN2 = new Line(OutEd, OutEdRe);
    LN1.ExtendLine(-Mul * 0.5, -Mul * 0.5);
    LN2.ExtendLine(-Mul * 0.5, -Mul * 0.5);
    let Ro1 = Transform.Rotate(Math.PI * 0.25, LabelSt, Vector.ZAxis);
    let Ro2 = Transform.Rotate(Math.PI * 0.25, LabelEd, Vector.ZAxis);
    LN1 = LN1.Transform(Ro1);
    LN2 = LN2.Transform(Ro2);
    this.TextLocation = [DIMArc.MidPoint];
    this.Geoms = {
      Point: [this.DefPoint1, this.DefPoint2, this.PointOnDim],
      Line: [LN1, LN2, LNSt, LNEd],
      Arc: [DIMArc],
    };
    let FinalVec = Vector.CreateFromTwoPoint(
      LabelSt.ClonePt(),
      LabelEd.ClonePt()
    ).Normalise();

    this.#TextAngle = Vector.Angle(FinalVec, Vector.XAxis);
  }
  static AddInstanceAngularDimension(scene, AGDim) {
    if (!AGDim.#SetUp) {
      return;
    }
    let Board = new TextBoard(
      AGDim.Content[0],
      256,
      128,
      AGDim.Style,
      AGDim.TextLocation[0]
    );
    TextBoard.AddInstanceBoard(scene, Board, AGDim.#TextAngle);

    for (const [Key, Value] of Object.entries(AGDim.Geoms)) {
      if (Key === "Point") {
        for (const item of Value) {
          Point.AddPointInstance(scene, item, 0.2, 0xff0000);
        }
      } else if (Key === "Line") {
        for (const LN of Value) {
          Line.AddLineInstance(scene, LN, 0xffffff, 0.5);
        }
      } else if (Key === "Arc") {
        for (const AC of Value) {
          Arc.AddArcInstance(scene, AC, 0xffffff, 0.5);
        }
      }
    }
  }
  SetContent(Content = "") {
    if (Content.includes("<>")) {
      Content.replace("<>", this.Angle.toString());
    }
    for (let i = 0; i < this.Content.length; i++) {
      this.Content[i] = Content;
    }
  }
}
export { AngularDimension };
