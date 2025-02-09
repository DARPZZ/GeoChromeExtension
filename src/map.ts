export default async function getMapString(lat:number,long:number,zoomLevel:number){
    let mapString :string;
    mapString = `https://maps.google.com/maps?q=${lat},${long}&z=${zoomLevel}&output=embed`;
    return mapString;

}
