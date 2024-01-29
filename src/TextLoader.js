import { Text } from "troika-three-text";
import { getColor } from "./utils";
import { parseDxfMTextContent } from '@dxfom/mtext';
import * as THREE from 'three';

/**
 * We need this class to help manage the async loading of the font file and the async creation of the text mesh.
 * All text should be created through a single instance and then the waitForTextToBeReady() method should be called
 */
export default class DxfTextLoader {
    constructor(fontUrl) {
        this.fontUrl = fontUrl;
    }

    _textPromises = [];

    /**
     * Generates a mesh object for the given text entity
     * @param {object} entity - the TEXT entity
     * @param {object} dxf - the DXF data object
     * @returns The Mesh object
     */
    drawText(entity, dxf) {
        let color = getColor(entity, dxf);

        let textEnt = new Text();
        textEnt.text = entity.text;
        textEnt.font = this.fontUrl;
        textEnt.fontSize = entity.height || 12;
        textEnt.position.x = entity.startPoint.x;
        textEnt.position.y = entity.startPoint.y;
        textEnt.position.z = entity.startPoint.z;
        textEnt.color = color;
        if (entity.rotation) {
            textEnt.rotation.z = entity.rotation * Math.PI / 180;
        }
        if (entity.directionVector) {
            var dv = entity.directionVector;
            textEnt.rotation.z = new THREE.Vector3(1, 0, 0).angleTo(new THREE.Vector3(dv.x, dv.y, dv.z));
        }
        
        this._textPromises.push(new Promise((resolve, reject) => {
            textEnt.sync(() => {
                resolve();
            });
        }));
        return textEnt;
    }

    drawMtext(entity, data) {
        var color = getColor(entity, data);
    
        var textAndControlChars = parseDxfMTextContent(entity.text);
    
        //Note: We currently only support a single format applied to all the mtext text
        var content = this._mtextContentAndFormattingToTextAndStyle(textAndControlChars, entity, color);
    
        var txt = this._createTextForScene(content.text, content.style, entity, color);
        if (!txt) return null;
    
        var group = new THREE.Object3D();
        group.add(txt);
        return group;
    }

    /**
     * Waits for all text to be ready for rendering. Call this when you are done creating all text.
     */
    waitForTextToBeReady() {
        return Promise.all(this._textPromises);
    }

    _mtextContentAndFormattingToTextAndStyle(textAndControlChars, entity, color) {
        let activeStyle = {
            horizontalAlignment: 'left',
            textHeight: entity.height
        }
    
        var text = [];
        for (let item of textAndControlChars) {
            if (typeof item === 'string') {
                if (item.startsWith('pxq') && item.endsWith(';')) {
                    if (item.indexOf('c') !== -1)
                        activeStyle.horizontalAlignment = 'center';
                    else if (item.indexOf('l') !== -1)
                        activeStyle.horizontalAlignment = 'left';
                    else if (item.indexOf('r') !== -1)
                        activeStyle.horizontalAlignment = 'right';
                    else if (item.indexOf('j') !== -1)
                        activeStyle.horizontalAlignment = 'justify';
                } else {
                    text.push(item);
                }
            } else if (Array.isArray(item)) {
                var nestedFormat = this._mtextContentAndFormattingToTextAndStyle(item, entity, color);
                text.push(nestedFormat.text);
            } else if (typeof item === 'object') {
                if (item['S'] && item['S'].length === 3) {
                    text.push(item['S'][0] + '/' + item['S'][2]);
                } else {
                    // not yet supported.
                }
            }
        }
        return {
            text: text.join(),
            style: activeStyle
        }
    }
    
    _createTextForScene(text, style, entity, color) {
        if (!text) return null;
    
        let textEnt = new Text();
        textEnt.text = text
            .replaceAll('\\P', '\n')
            .replaceAll('\\X', '\n');
    
        textEnt.font = this.fontUrl;
        textEnt.fontSize = style.textHeight;
        textEnt.maxWidth = entity.width;
        textEnt.position.x = entity.position.x;
        textEnt.position.y = entity.position.y;
        textEnt.position.z = entity.position.z;
        textEnt.textAlign = style.horizontalAlignment;
        textEnt.color = color;
        if (entity.rotation) {
            textEnt.rotation.z = entity.rotation * Math.PI / 180;
        }
        if (entity.directionVector) {
            var dv = entity.directionVector;
            textEnt.rotation.z = new THREE.Vector3(1, 0, 0).angleTo(new THREE.Vector3(dv.x, dv.y, dv.z));
        }
        switch (entity.attachmentPoint) {
            case 1:
                // Top Left
                textEnt.anchorX = 'left';
                textEnt.anchorY = 'top';
                break;
            case 2:
                // Top Center
                textEnt.anchorX = 'center';
                textEnt.anchorY = 'top';
                break;
            case 3:
                // Top Right
                textEnt.anchorX = 'right';
                textEnt.anchorY = 'top';
                break;
    
            case 4:
                // Middle Left
                textEnt.anchorX = 'left';
                textEnt.anchorY = 'middle';
                break;
            case 5:
                // Middle Center
                textEnt.anchorX = 'center';
                textEnt.anchorY = 'middle';
                break;
            case 6:
                // Middle Right
                textEnt.anchorX = 'right';
                textEnt.anchorY = 'middle';
                break;
    
            case 7:
                // Bottom Left
                textEnt.anchorX = 'left';
                textEnt.anchorY = 'bottom';
                break;
            case 8:
                // Bottom Center
                textEnt.anchorX = 'center';
                textEnt.anchorY = 'bottom';
                break;
            case 9:
                // Bottom Right
                textEnt.anchorX = 'right';
                textEnt.anchorY = 'bottom';
                break;
    
            default:
                return undefined;
        };
    
        this._textPromises.push(new Promise((resolve, reject) => {
            textEnt.sync(() => {
                if (textEnt.textAlign !== 'left') {
                    textEnt.geometry.computeBoundingBox();
                    var textWidth = textEnt.geometry.boundingBox.max.x - textEnt.geometry.boundingBox.min.x;
                    if (textEnt.textAlign === 'center') textEnt.position.x += (entity.width - textWidth) / 2;
                    if (textEnt.textAlign === 'right') textEnt.position.x += (entity.width - textWidth);
                }
                resolve();
            });
        }));
    
        return textEnt;
    }
    
}