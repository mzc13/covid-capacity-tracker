const parkingCount = document.getElementById("parkingCount") as HTMLParagraphElement;
const masjidCount = document.getElementById("masjidCount") as HTMLParagraphElement;
const lastUpdated = document.getElementById("lastUpdated") as HTMLSpanElement;

/* Project Types Start */
type CapacityQueryResponse = {
  parking_count: number;
  masjid_count: number;
  timestamp: number;
};
/* Project Types End */

async function queryCapacity() {
  try {
    const res = await fetch("/capacity_details");
    const data: CapacityQueryResponse = await res.json();

    parkingCount.innerText = data.parking_count.toString();
    masjidCount.innerText = data.masjid_count.toString();
    lastUpdated.innerText = new Date(data.timestamp).toLocaleString();
  } catch (error) {
    console.error(error);
  }
}

queryCapacity();

// Query Every 5 seconds
setInterval(queryCapacity, 5000);

export {};
