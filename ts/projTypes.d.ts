type CapacityUpdateRequest = {
  parking_count: number | undefined;
  masjid_count: number | undefined;
  timestamp: number | undefined;
};
type CapacityQueryResponse = {
  parking_count: number;
  masjid_count: number;
  timestamp: number;
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
type DetailedUpdateRequest = {
  parking_count: number | undefined;
  masjid_count: number | undefined;
  main_hall_count: number | undefined;
  mpr_count: number | undefined;
  upstairs_count: number | undefined;
  timestamp: number | undefined;
};
