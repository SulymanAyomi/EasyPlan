import { Task } from "../types";
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";

const locales = {
  "en-Us": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
});

interface DataCalenderProps {
  data: Task[];
}

export const DataCalendar = ({ data }: DataCalenderProps) => {
  return <div>data calender</div>;
};
