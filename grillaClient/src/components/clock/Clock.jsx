import React, { useEffect, useState } from "react";
import { Number } from "./Number";
import { Word } from "./Word";
import "./Clock.css";

const days = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export const Clock = () => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [day, setDay] = useState(0);

  useEffect(() => {
    const update = () => {
      const date = new Date();
      let hour = date.getHours();
      setHour(hour);
      setMinute(date.getMinutes());
      setSecond(date.getSeconds());
      setDay(date.getDay());
    };

    update();

    const interval = setInterval(() => {
      update();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock w-fit flex justify-center items-center text-center m-auto">
      <div className="calendar text-2xl">
        {days.map((value, index) => (
          <Word key={value} value={value} hidden={index != day} />
        ))}
      </div>
      <div className="row">
        <div className="hour">
          <Number value={hour} />
          <Word value={":"} />
          <Number value={minute} />
          <Word value={":"} />
          <Number value={second} />
        </div>
      </div>
    </div>
  );
};
