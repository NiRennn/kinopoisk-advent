import { useState } from "react";
import { createPortal } from "react-dom";
import "./PastDay.scss";
import Button from "../Button/Button";
import cross from "../../assets/icons/cross.svg";
import station from "../../assets/images/cells/ice-yandex1.png";

type PastDayProps = {
  image?: string | null;
  text?: string | null;
  onClose: () => void;
  onOpen: () => void;
};

function PastDay({ image, text, onClose, onOpen }: PastDayProps) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
  };

  return createPortal(
    <div
      className={`past${closing ? " past--closing" : ""}`}
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
        className="past__veil"
        aria-label="Закрыть"
        onClick={close}
      />
      <div className="past__card">
        <button type="button" className="past__close" aria-label="Закрыть" onClick={close}>
          <img src={cross} alt="" />
        </button>
        <div className="past__copy">
          <img className="past__prize" src={image || station} alt="" />
          <h2 className="past__title">
            Итоги уже
            <br />
            известны
          </h2>
          <p className="past__text">
            {text ||
              "Lorem ipsum dolor sit amet consectetur. Donec orci ullamcorper sed diam in massa. Faucibus ullamcorper ac consequat feugiat sit viverra fringilla feugiat. Dui id eu netus at neque amet."}
          </p>
        </div>
        <Button onClick={onOpen}>Открыть итоги</Button>
      </div>
    </div>,
    document.body,
  );
}

export default PastDay;
