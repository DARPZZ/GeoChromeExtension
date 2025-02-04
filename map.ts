export default function getMapString(lat:number,long:number){
    let mapString :string;
    mapString = `https://maps.google.com/maps?q=${lat},${long}&z=5&output=embed`;
    return mapString;

}