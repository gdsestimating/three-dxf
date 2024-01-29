import { IDxf, IMtextEntity, ITextEntity } from "dxf-parser";
import { Text } from "troika-three-text";

export interface ITextLoader {
    drawText(entity: ITextEntity, dxf: IDxf): Text | undefined;
    drawMtext(entity: IMtextEntity, data: IDxf): THREE.Object3D | undefined;
}