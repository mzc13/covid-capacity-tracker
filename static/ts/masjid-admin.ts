/* Project Types Start */
enum Locations {
  MAIN_VACCINATED = "Main (Vaccinated)",
  MAIN_UNVACCINATED = "Main (Unvaccinated)",
  UPSTAIRS = "Upstairs",
}
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
type DetailedUpdateRequest = {
  parking_count: number | undefined;
  masjid_count: number | undefined;
  main_hall_count: number | undefined;
  mpr_count: number | undefined;
  upstairs_count: number | undefined;
  timestamp: number | undefined;
};
/* Project Types End */

const btns = {
  sub1: document.getElementById("sub1") as HTMLButtonElement,
  add1: document.getElementById("add1") as HTMLButtonElement,
  sub5: document.getElementById("sub5") as HTMLButtonElement,
  add5: document.getElementById("add5") as HTMLButtonElement,
  sub10: document.getElementById("sub10") as HTMLButtonElement,
  add10: document.getElementById("add10") as HTMLButtonElement,
  left: document.getElementById("leftButton") as HTMLButtonElement,
  right: document.getElementById("rightButton") as HTMLButtonElement,
};
const masjidCountElement = document.getElementById("masjidCount") as HTMLParagraphElement;
const capacityLabel = document.getElementById("capacityLabel") as HTMLHeadingElement;
const lastUpdated = document.getElementById("lastUpdated") as HTMLSpanElement;
const mainLogo = document.getElementById("mainLogo") as HTMLDivElement;
let timestamp = -1;
let prevCounts = {
  "Main (Vaccinated)": 0,
  "Main (Unvaccinated)": 0,
  Upstairs: 0,
};
let counts = {
  "Main (Vaccinated)": 0,
  "Main (Unvaccinated)": 0,
  Upstairs: 0,
};
let updateTimeout = -1;
let currentLocation = Locations.MAIN_VACCINATED;

function processQueryResponse(data: DetailedQueryResponse) {
  timestamp = data.masjid_timestamp;
  lastUpdated.innerText = new Date(timestamp).toLocaleString();
  prevCounts[Locations.MAIN_VACCINATED] = data.main_hall_count;
  prevCounts[Locations.MAIN_UNVACCINATED] = data.mpr_count;
  prevCounts[Locations.UPSTAIRS] = data.upstairs_count;
  counts[Locations.MAIN_VACCINATED] = prevCounts[Locations.MAIN_VACCINATED];
  counts[Locations.MAIN_UNVACCINATED] = prevCounts[Locations.MAIN_UNVACCINATED];
  counts[Locations.UPSTAIRS] = prevCounts[Locations.UPSTAIRS];
  updateCountElement();
}

async function queryCapacity() {
  try {
    const res = await fetch("/capacity_details");
    const data: DetailedQueryResponse = await res.json();

    if (data.masjid_timestamp < timestamp) {
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
    let reqJson: DetailedUpdateRequest = {
      masjid_count:
        counts[Locations.MAIN_VACCINATED] + counts[Locations.MAIN_UNVACCINATED] + counts[Locations.UPSTAIRS],
      main_hall_count: counts[Locations.MAIN_VACCINATED],
      mpr_count: counts[Locations.MAIN_UNVACCINATED],
      upstairs_count: counts[Locations.UPSTAIRS],
      timestamp: timestamp,
      parking_count: undefined,
    };
    const res = await fetch("/update_masjid_capacity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqJson),
    });
    const data: DetailedQueryResponse = await res.json();

    if (data.masjid_timestamp < timestamp) {
      return;
    } else {
      processQueryResponse(data);
    }
  } catch (error) {
    console.error(error);
  }
}

function updateCountElement() {
  masjidCountElement.innerText = counts[currentLocation].toString();
  capacityLabel.innerText = currentLocation;
}

function btnClick(capacityDiff: number) {
  clearTimeout(updateTimeout);
  let tempCapacity = counts[currentLocation] + capacityDiff;
  counts[currentLocation] = Math.max(tempCapacity, 0);
  updateCountElement();
  if (counts[currentLocation] != prevCounts[currentLocation]) {
    timestamp = Date.now();
    updateTimeout = window.setTimeout(updateCapacity, 500);
  }
}

function locationLeftShift() {
  if (currentLocation == Locations.MAIN_VACCINATED) {
    currentLocation = Locations.UPSTAIRS;
  } else if (currentLocation == Locations.MAIN_UNVACCINATED) {
    currentLocation = Locations.MAIN_VACCINATED;
  } else if (currentLocation == Locations.UPSTAIRS) {
    currentLocation = Locations.MAIN_UNVACCINATED;
  }
  updateCountElement();
}

function locationRightShift() {
  if (currentLocation == Locations.MAIN_VACCINATED) {
    currentLocation = Locations.MAIN_UNVACCINATED;
  } else if (currentLocation == Locations.MAIN_UNVACCINATED) {
    currentLocation = Locations.UPSTAIRS;
  } else if (currentLocation == Locations.UPSTAIRS) {
    currentLocation = Locations.MAIN_VACCINATED;
  }
  updateCountElement();
}

async function init() {
  queryCapacity();
  btns.sub1.onclick = () => btnClick(-1);
  btns.add1.onclick = () => btnClick(1);
  btns.sub5.onclick = () => btnClick(-5);
  btns.add5.onclick = () => btnClick(5);
  btns.sub10.onclick = () => btnClick(-10);
  btns.add10.onclick = () => btnClick(10);
  btns.left.onclick = locationLeftShift;
  btns.right.onclick = locationRightShift;
  mainLogo.onclick = () => {
    window.location.href = "./admin";
  };
  window.setInterval(queryCapacity, 1000);
}

init();

export {};
