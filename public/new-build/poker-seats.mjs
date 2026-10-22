// Physical seats stay fixed even when a player leaves or buys back in.
// Rotate the same seats for a phone so its owner stays at the bottom.
export function pokerSeatPosition(seat, ownSeat, size=9, mobile=false){
 const layouts={
  6:mobile?[[50,91],[15,76],[16,34],[50,12],[84,34],[85,76]]:[[50,90],[10,74],[12,30],[50,14],[88,30],[90,74]],
  8:mobile?[[50,91],[15,79],[14,54],[24,25],[50,10],[76,25],[86,54],[85,79]]:[[50,90],[20,79],[7,55],[25,18],[50,12],[75,18],[93,55],[80,79]],
  9:mobile?[[50,91],[15,79],[14,57],[16,34],[28,12],[72,12],[84,34],[86,57],[85,79]]:[[50,90],[20,79],[7,56],[12,31],[35,14],[65,14],[88,31],[93,56],[80,79]]
 };
 size=[6,8,9].includes(size)?size:9;
 const offset=Number.isInteger(ownSeat)?ownSeat:0;
 return layouts[size][((seat-offset)%size+size)%size];
}
