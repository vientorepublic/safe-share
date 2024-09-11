import utc from "dayjs/plugin/utc";
import _dayjs from "dayjs";

_dayjs.extend(utc);

export const dayjs = _dayjs;
