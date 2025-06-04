const maxDifForReset =0.5
const minDifForReset = 0.5
export function CheckDifForLongitudeAndLatitude(longitude:number, latitude:number)
{
  if(longitude > longitude+maxDifForReset || latitude > latitude+maxDifForReset)
  {
    return true
  }else if(longitude< longitude-minDifForReset || latitude<latitude+minDifForReset)
  {
    return true
  }
  return false
}
