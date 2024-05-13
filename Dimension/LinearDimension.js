import { Point, Vector } from "../GeomUtil/XYZ.js";
import { Transform } from "../GeomUtil/Transform.js";
import { Line } from "../GeomUtil/Line.js";
import { TextStyle } from "./TextStyle.js";
import TextBoard from "./TextBoard.js";

class LinearDimension {
  Geoms;
  StartPoint;
  EndPoint;
  /**
   * PointOnDim is a point determine the third point to set the dimension.
   * TextLocation is the actual point located on the Dimension Label.
   */
  PointOnDim;
  TextLocation;
  Content;
  Distance;
  Style;
  #TextAngle;
  #LabelPositions;
  #SetUp;
  #DimVector;
  #IsContinue = false;
  constructor(
    StartPoint = Point.Origin,
    EndPoint = new Point(5, 5, 0),
    PointOnDim = new Point(7.5, 7.5, 0),
    Style = TextStyle.DefaultStyle()
  ) {
    this.StartPoint = StartPoint;
    this.EndPoint = EndPoint;
    this.PointOnDim = PointOnDim;
    this.Style = Style;
    this.Distance = Math.round(StartPoint.DistTo(EndPoint) * 100) / 100;
    this.Content = [this.Distance.toString()];
    if (Point.IsColinear(this.StartPoint, this.EndPoint, this.PointOnDim)) {
      console.log("The Points are colinear");
      this.#SetUp = false;
    }
    this.#SetUp = true;
    this.Geoms = {};
    let DimVec = Vector.CreateFromTwoPoint(
      new Line(this.StartPoint, this.EndPoint).VerticalPointOnLine(
        this.PointOnDim
      ),
      this.PointOnDim
    );
    this.#constructParaGeoms(DimVec);
    this.#DimVector = DimVec.Normalise();
  }
  /**
   *
   * @param  {...Point} Points
   */
  ContinueLabel(...Points) {
    this.#IsContinue = true;
    for (let i = 0; i < Points.length; i++) {
      this.Geoms["Point"].push(Points[i]);
      if (
        Points[i].DistTo(this.#LabelPositions[0]) <
        Points[i].DistTo(this.#LabelPositions[0])
      ) {
        //Undeveloping
      } else {
        //Undeveloping
      }
    }
  }

  /**
   *
   * @param {Point} StartPoint
   * @param {Point} EndPoint
   * @param {Point} PointOnDim
   * @param {Vector} ExVector
   * @param {TextStyle} Style
   * @returns
   */
  static CreateDimensionWithVector(
    StartPoint = Point.Origin,
    EndPoint = new Point(5, 0, 0),
    PointOnDim = new Point(3, 5, 0),
    ExVector = new Vector(0, 2, 0),
    Style = TextStyle.DefaultStyle()
  ) {
    ExVector = ExVector.Normalise();
    var StEdVec = Vector.CreateFromTwoPoint(StartPoint, EndPoint);
    StEdVec = StEdVec.Normalise();
    let Theta = Vector.Angle(StEdVec, ExVector);
    if (Theta === 0) {
      return new LinearDimension(StartPoint, EndPoint, PointOnDim, Style);
    }
    Theta = Math.abs(Math.PI - Theta);
    let DistStEd = StartPoint.DistTo(EndPoint);
    let TempN = Math.sqrt(
      Math.pow(Math.cos(Theta) * DistStEd, 2) / ExVector.length()
    );
    let TempEd;
    if ((Theta = Vector.Angle(StEdVec, ExVector) > Math.PI * 0.5)) {
      TempEd = EndPoint.ClonePt().Add(ExVector.Multiple(TempN));
    } else {
      TempEd = EndPoint.ClonePt().Add(ExVector.Multiple(TempN).Reverse());
    }

    var DIM = new LinearDimension(StartPoint, TempEd, PointOnDim, Style);
    console.log(EndPoint);
    DIM.Geoms["Point"].pop();
    DIM.Geoms["Point"].push(EndPoint);

    let LabelToEndPt = Vector.CreateFromTwoPoint(
      EndPoint,
      DIM.#LabelPositions[1]
    );
    LabelToEndPt = LabelToEndPt.Normalise();
    let TempEnd = EndPoint.ClonePt().Add(
      LabelToEndPt.Multiple(Style.parameters.DIMDist)
    );
    let NewLNEd = new Line(DIM.#LabelPositions[1], TempEnd).ExtendLine(
      Style.parameters.DIMDist,
      0
    );
    DIM.Geoms["Line"].pop();
    DIM.Geoms["Line"].push(NewLNEd);
    DIM.#DimVector = ExVector;
    return DIM;
  }

  SetContent(Content = "") {
    if (Content.includes("<>")) {
      Content.replace("<>", this.Distance.toString());
    }
    for (let i = 0; i < this.Content.length; i++) {
      this.Content[i] = Content;
    }
  }
  /**
   *
   * @param {Vector} DIMVector
   */
  #constructParaGeoms(DIMVector) {
    let Mul = this.Style.parameters.DIMDist;
    const UnitVer = DIMVector.Clone().Normalise().Multiple(Mul);
    const ShiftSt = this.StartPoint.ClonePt().Translate(UnitVer);
    const ShiftEd = this.EndPoint.ClonePt().Translate(UnitVer);
    const LabelSt = this.StartPoint.ClonePt().Translate(DIMVector);
    const LabelEd = this.EndPoint.ClonePt().Translate(DIMVector);

    const OutSt = LabelSt.ClonePt().Translate(UnitVer);
    const OutEd = LabelEd.ClonePt().Translate(UnitVer);

    const LNSt = new Line(ShiftSt, OutSt.ClonePt());
    const LNEd = new Line(ShiftEd, OutEd.ClonePt());

    const DIMBar = new Line(LabelSt.ClonePt(), LabelEd.ClonePt()).ExtendLine(
      Mul,
      Mul
    );
    let ReverseVec = UnitVer.Reverse();
    const OutStRe = LabelSt.ClonePt().Translate(ReverseVec);
    const OutEdRe = LabelEd.ClonePt().Translate(UnitVer.Reverse());

    let LN1 = new Line(OutSt, OutStRe);
    let LN2 = new Line(OutEd, OutEdRe);
    LN1.ExtendLine(-Mul * 0.5, -Mul * 0.5);
    LN2.ExtendLine(-Mul * 0.5, -Mul * 0.5);
    let Ro1 = Transform.Rotate(Math.PI * 0.25, LabelSt, Vector.ZAxis);
    let Ro2 = Transform.Rotate(Math.PI * 0.25, LabelEd, Vector.ZAxis);
    LN1 = LN1.Transform(Ro1);
    LN2 = LN2.Transform(Ro2);
    this.TextLocation = [DIMBar.MidPoint];
    this.Geoms = {
      Point: [this.StartPoint, this.EndPoint],
      Line: [DIMBar, LN1, LN2, LNSt, LNEd],
    };
    this.#LabelPositions = [LabelSt.ClonePt(), LabelEd.ClonePt()];
    let FinalVec = Vector.CreateFromTwoPoint(
      LabelSt.ClonePt(),
      LabelEd.ClonePt()
    ).Normalise();

    this.#TextAngle = Vector.Angle(FinalVec, Vector.XAxis);
  }
  /**
   *
   * @param {THREE.Scene} scene
   * @param {LinearDimension} LNDim
   */
  static AddInstanceLinearDimension(scene, LNDim) {
    if (!LNDim.#SetUp) {
      return;
    }
    if (!LNDim.#IsContinue) {
      let Board = new TextBoard(
        LNDim.Content[0],
        256,
        128,
        LNDim.Style,
        LNDim.TextLocation[0]
      );
      TextBoard.AddInstanceBoard(scene, Board, LNDim.#TextAngle);
    } else {
    }
    for (const [Key, Value] of Object.entries(LNDim.Geoms)) {
      if (Key === "Point") {
        for (const item of Value) {
          Point.AddPointInstance(scene, item, 0.2, 0xff0000);
        }
      } else {
        for (const LN of Value) {
          Line.AddLineInstance(scene, LN, 0xffffff, 0.5);
        }
      }
    }
  }
}

export { LinearDimension };
