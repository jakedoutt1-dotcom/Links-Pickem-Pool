// Physical seats stay fixed even when a player leaves or buys back in.
// Rotate the same seats for a phone so its owner stays at the bottom.
export function pokerSeatPosition(seat, ownSeat, size=9, mobile=false){
 const layouts={
  6:mobile?[[50,91],[15,76],[16,34],[50,12],[84,34],[85,76]]:[[50,95],[10,75],[12,25],[50,7],[88,25],[90,75]],
  8:mobile?[[50,91],[15,79],[14,54],[24,25],[50,10],[76,25],[86,54],[85,79]]:[[50,95],[20,86],[7,53],[25,9],[50,7],[75,9],[93,53],[80,86]],
  9:mobile?[[50,91],[15,79],[14,57],[16,34],[28,12],[72,12],[84,34],[86,57],[85,79]]:[[50,95],[20,86],[7,60],[12,28],[35,8],[65,8],[88,28],[93,60],[80,86]]
 };
 size=[6,8,9].includes(size)?size:9;
 const offset=Number.isInteger(ownSeat)?ownSeat:0;
 return layouts[size][((seat-offset)%size+size)%size];
}
