import express from "express";
import cookieParser from "cookie-parser";
import fs from "fs/promises";

const app = express();

const host = process.argv[2];
const port = Number.parseInt(process.argv[3]);
const APP_PATH = process.env["APP_PATH"];
const APP_PASSWORD = process.env["APP_PASSWORD"];

let sessionToken = Math.floor(Math.random() * 1000000000).toFixed();
let tokenCheckMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.cookies["capSessionToken"] != sessionToken) {
    res.redirect("/login");
  } else {
    next();
  }
};

var parkingCount = 0;
var mainHallCount = 0;
var mprCount = 0;
var upstairsCount = 0;
var latestParkingTime = Date.now();
var latestMasjidTime = Date.now();

app.use(express.json());
app.use(cookieParser());

let masjidTotal = () => mainHallCount + mprCount + upstairsCount;

let detailedQueryResponse: () => DetailedQueryResponse = () => {
  return {
    parking_count: parkingCount,
    masjid_count: masjidTotal(),
    timestamp: Math.max(latestMasjidTime, latestParkingTime),
    masjid_timestamp: latestMasjidTime,
    parking_timestamp: latestParkingTime,
    main_hall_count: mainHallCount,
    mpr_count: mprCount,
    upstairs_count: upstairsCount,
  };
};

app.get("/login", (req, res) => {
  if (req.cookies.sessionToken == sessionToken) {
    res.redirect("/admin");
  } else {
    res.sendFile(APP_PATH + "/static/login.html");
  }
});

app.post("/login", async (req, res) => {
  if (APP_PASSWORD == req.body["password"]) {
    // Set sessionToken cookie for the next 30 days
    res.cookie("capSessionToken", sessionToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true });
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.get("/admin", tokenCheckMiddleware, async (req, res) => {
  res.sendFile(APP_PATH + "/static/admin.html");
});
app.get("/masjid-admin", tokenCheckMiddleware, async (req, res) => {
  res.sendFile(APP_PATH + "/static/masjid-admin.html");
});
app.get("/parking-admin", tokenCheckMiddleware, async (req, res) => {
  res.sendFile(APP_PATH + "/static/parking-admin.html");
});

app.get("/capacity_details", async (req, res) => {
  res.send(detailedQueryResponse());
});

app.post("/update_parking_capacity", tokenCheckMiddleware, async (req, res) => {
  let body: CapacityUpdateRequest = req.body;
  if (body.timestamp == null || body.parking_count == null) {
    res.sendStatus(400);
    return;
  }
  if (body.timestamp < latestParkingTime) {
    res.send(detailedQueryResponse());
    return;
  }
  latestParkingTime = body.timestamp;
  parkingCount = Math.max(body.parking_count, 0);
  res.send(detailedQueryResponse());
  try {
    await fs.appendFile(
      APP_PATH + "/logs/capacity.log",
      `${latestParkingTime}, ${parkingCount}, ${masjidTotal()}\n`
    );
  } catch (error) {
    console.error(error);
  }
});

app.post("/update_masjid_capacity", tokenCheckMiddleware, async (req, res) => {
  let body: DetailedUpdateRequest = req.body;
  if (
    body.timestamp == null ||
    body.main_hall_count == null ||
    body.mpr_count == null ||
    body.upstairs_count == null
  ) {
    res.sendStatus(400);
    return;
  }
  if (body.timestamp < latestMasjidTime) {
    res.send(detailedQueryResponse());
    return;
  }
  latestMasjidTime = body.timestamp;
  mainHallCount = Math.max(body.main_hall_count, 0);
  mprCount = Math.max(body.mpr_count, 0);
  upstairsCount = Math.max(body.upstairs_count, 0);
  res.send(detailedQueryResponse());
  try {
    await fs.appendFile(
      APP_PATH + "/logs/capacity.log",
      `${latestMasjidTime}, ${parkingCount}, ${masjidTotal()}\n`
    );
  } catch (error) {
    console.error(error);
  }
});

app.use(express.static(APP_PATH + "/static"));

app.listen(port, host, () => {
  console.log(`App listening at http://${host}:${port}`);
});
