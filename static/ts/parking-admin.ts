const btns = {
  sub1: document.getElementById("sub1") as HTMLButtonElement,
  add1: document.getElementById("add1") as HTMLButtonElement,
  sub5: document.getElementById("sub5") as HTMLButtonElement,
  add5: document.getElementById("add5") as HTMLButtonElement,
  sub10: document.getElementById("sub10") as HTMLButtonElement,
  add10: document.getElementById("add10") as HTMLButtonElement,
};
const parkingCountElement = document.getElementById("parkingCount") as HTMLParagraphElement;
const lastUpdated = document.getElementById("lastUpdated") as HTMLSpanElement;
const mainLogo = document.getElementById("mainLogo") as HTMLDivElement;
let timestamp = -1;
let prevParkingCount = 0;
let parkingCount = 0;
let updateTimeout = -1;

/* Project Types Start */
type CapacityUpdateRequest = {
  parking_count: number | undefined;
  masjid_count: number | undefined;
  timestamp: number | undefined;
};
type DetailedQueryResponse = {
  parking_count: number;
  masjid_count: number;
  main_hall_count: number;
  mpr_count: number;
  upstairs_count: number;
  timestamp: number;
  parking_timestamp: number;
  masjid_timestamp: number;
};
/* Project Types End */

function processQueryResponse(data: DetailedQueryResponse) {
  timestamp = data.parking_timestamp;
  lastUpdated.innerText = new Date(timestamp).toLocaleString();
  prevParkingCount = data.parking_count;
  parkingCount = prevParkingCount;
  parkingCountElement.innerText = parkingCount.toString();
}

async function queryCapacity() {
  try {
    const res = await fetch("/capacity_details");
    const data: DetailedQueryResponse = await res.json();

    if (data.parking_timestamp < timestamp) {
      return;
    } else {
      processQueryResponse(data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateCapacity() {
  try {
    let reqJson: CapacityUpdateRequest = {
      parking_count: parkingCount,
      timestamp: timestamp,
      masjid_count: undefined,
    };
    const res = await fetch("/update_parking_capacity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqJson),
    });
    const data: DetailedQueryResponse = await res.json();

    if (data.parking_timestamp < timestamp) {
      return;
    } else {
      processQueryResponse(data);
    }
  } catch (error) {
    console.error(error);
  }
}

function btnClick(capacityDiff: number) {
  clearTimeout(updateTimeout);
  let tempCapacity = parkingCount + capacityDiff;
  parkingCount = Math.max(tempCapacity, 0);
  parkingCountElement.innerText = parkingCount.toString();
  if (parkingCount != prevParkingCount) {
    timestamp = Date.now();
    updateTimeout = window.setTimeout(updateCapacity, 500);
  }
}

async function init() {
  queryCapacity();
  btns.sub1.onclick = () => btnClick(-1);
  btns.add1.onclick = () => btnClick(1);
  btns.sub5.onclick = () => btnClick(-5);
  btns.add5.onclick = () => btnClick(5);
  btns.sub10.onclick = () => btnClick(-10);
  btns.add10.onclick = () => btnClick(10);
  mainLogo.onclick = () => {
    window.location.href = "./admin";
  };
  window.setInterval(queryCapacity, 1000);
}

init();

export {};
