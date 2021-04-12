const parkingCount = document.getElementById("parkingCount") as HTMLParagraphElement;
const masjidCount = document.getElementById("masjidCount") as HTMLParagraphElement;
const lastUpdated = document.getElementById("lastUpdated") as HTMLSpanElement;
const parkingDiv = document.getElementById("parkingDiv") as HTMLDivElement;
const masjidDiv = document.getElementById("masjidDiv") as HTMLDivElement;

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

parkingDiv.onclick = () => {
  window.location.href = "./parking-admin";
};
masjidDiv.onclick = () => {
  window.location.href = "./masjid-admin";
};

// Query Every 1 second
setInterval(queryCapacity, 1000);

export {};
