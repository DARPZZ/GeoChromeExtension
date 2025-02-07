"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getMapString;
function getMapString(lat, long, zoomLevel) {
    let mapString;
    mapString = `https://maps.google.com/maps?q=${lat},${long}&z=${zoomLevel}&output=embed`;
    return mapString;
}
