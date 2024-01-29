export function getColor(entity, dxf) {
    let color;
    if (entity.color) {
        // color by entity case
        color = entity.color;
    } else {
        // color by layer case
        color = dxf.tables?.layer?.layers?.[entity.layer]?.color;
    }

    if (color == null) {
        // default to black
        color = 0x000000;
    }
    return color;
}