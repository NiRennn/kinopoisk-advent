import { useState } from "react";
import { createPortal } from "react-dom";
import "./LaterDay.scss";
import Button from "../Button/Button";
import calendar from "../../assets/icons/calendar.svg";
import cross from "../../assets/icons/cross.svg";
import { formatDayMonth } from "../../advent/format";

type LaterDayProps = {
  date: string;
  onClose: () => void;
};

function LaterDay({ date, onClose }: LaterDayProps) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
  };

  return createPortal(
    <div
      className={`later${closing ? " later--closing" : ""}`}
      onAnimationEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.animationName === "overlay-out" &&
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
          <h2 className="later__title">Откроем {formatDayMonth(date)}</h2>
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
