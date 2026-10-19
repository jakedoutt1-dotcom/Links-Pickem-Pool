// Physical seats stay fixed even when a player leaves or buys back in.
// Rotate the same seats for a phone so its owner stays at the bottom.
export function pokerSeatPosition(seat, ownSeat, size=9, mobile=false){
 const layouts={
  6:mobile?[[50,95],[15,77],[16,32],[50,7],[84,32],[85,77]]:[[50,95],[10,75],[12,25],[50,7],[88,25],[90,75]],
  8:mobile?[[50,95],[15,82],[14,53],[24,12],[50,7],[76,12],[86,53],[85,82]]:[[50,95],[20,86],[7,53],[25,9],[50,7],[75,9],[93,53],[80,86]],
  9:mobile?[[50,95],[15,82],[14,59],[16,35],[28,10],[72,10],[84,35],[86,59],[85,82]]:[[50,95],[20,86],[7,60],[12,28],[35,8],[65,8],[88,28],[93,60],[80,86]]
 };
 size=[6,8,9].includes(size)?size:9;
 const offset=Number.isInteger(ownSeat)?ownSeat:0;
 return layouts[size][((seat-offset)%size+size)%size];
}
