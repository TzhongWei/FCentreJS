import { Point, Vector } from '../GeomUtil/XYZ.js';


class TextStyle {
    name;
    parameters = {
        fontsize: null,
        fontfamily: null,
        textcolour: null,
        backgroundcolour: null,
        weigth: null,
        borderThickness: null,
        borderColor: null,
        showBoard: null,
        showStroke: null,
        px: null,
        DIMDist: null
    };
    constructor(StyleName) {
        this.name = StyleName;
    }
    static DefaultStyle() {
        var Style = new TextStyle("Default");
        Style.parameters.fontfamily = "Arial";
        Style.parameters.fontsize = 20;
        Style.parameters.textcolour = 'black';
        Style.parameters.backgroundcolour = -1;
        Style.parameters.px = '20px';
        Style.parameters.DIMDist = 0.3;
        return Style;
    }
}

export { TextStyle }