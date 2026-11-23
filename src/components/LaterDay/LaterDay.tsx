import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./LaterDay.scss";
import Button from "../Button/Button";
import calendar from "../../assets/icons/calendar.svg";
import cross from "../../assets/icons/cross.svg";

type LaterDayProps = {
  day: number;
  onClose: () => void;
};

function LaterDay({ day, onClose }: LaterDayProps) {
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = () => {
    if (closing) return;
    setClosing(true);
  };

  return createPortal(
    <div
      className={`later${shown ? " later--in" : ""}${closing ? " later--closing" : ""}`}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === "opacity" &&
          closing
        ) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        className="later__veil"
        aria-label="Закрыть"
        onClick={close}
      />
      <div className="later__card">
        <button type="button" className="later__close" aria-label="Закрыть" onClick={close}>
          <img src={cross} alt="" />
        </button>
        <div className="later__copy">
          <img className="later__icon" src={calendar} alt="" />
          <h2 className="later__title">Откроем {day} декабря</h2>
          <p className="later__text">
            Lorem ipsum dolor sit amet consectetur. Donec orci ullamcorper sed
            diam in massa. Faucibus ullamcorper ac consequat feugiat sit viverra
            fringilla feugiat. Dui id eu netus at neque amet.
          </p>
        </div>
        <Button onClick={close}>Подожду</Button>
      </div>
    </div>,
    document.body,
  );
}

export default LaterDay;
