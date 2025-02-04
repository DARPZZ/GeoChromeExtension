"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getMapString;
function getMapString(lat, long) {
    let mapString;
    mapString = `https://maps.google.com/maps?q=${lat},${long}&z=5&output=embed`;
    return mapString;
}
