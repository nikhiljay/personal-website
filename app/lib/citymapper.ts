export function citymapperDirectionsUrl({
  lat,
  lng,
  name,
  address,
}: {
  lat: number;
  lng: number;
  name: string;
  address: string;
}) {
  const params = new URLSearchParams({
    endcoord: `${lat},${lng}`,
    endname: name,
    endaddress: address,
  });

  return `https://citymapper.com/directions?${params.toString()}`;
}
