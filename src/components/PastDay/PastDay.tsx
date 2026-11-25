import { useRef, useState } from "react";
import { useTelegramBackButton } from "../../utils/telegramBack";
import { sheetOut } from "../../utils/motion";
import { createPortal } from "react-dom";
import "./PastDay.scss";
import Button from "../Button/Button";
import cross from "../../assets/icons/cross.svg";
import station from "../../assets/images/cells/ice-prize1.png";
import { formatNbsp } from "../../utils/typography";

type PastDayProps = {
  image?: string | null;
  text?: string | null;
  onClose: () => void;
  onOpen: () => void;
};

function PastDay({ image, text, onClose, onOpen }: PastDayProps) {
  const [closing, setClosing] = useState(false);
  const opening = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const close = () => {
    if (closing || opening.current) return;
    setClosing(true);
  };
  useTelegramBackButton(close);

  const open = () => {
    if (closing || opening.current) return;
    opening.current = true;
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) {
      onOpen();
      return;
    }
    root.style.animation = "none";
    card.style.animation = "none";
    sheetOut(root, card, onOpen);
  };

  return createPortal(
    <div
      ref={rootRef}
      className={`past${closing ? " past--closing" : ""}`}
      onAnimationEnd={(event) => {
        if (event.animationName === "sheet-out" && closing) onClose();
      }}
    >
      <button
        type="button"
        className="past__veil"
        aria-label="Закрыть"
        onClick={close}
      />
      <div ref={cardRef} className="past__card">
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
            {formatNbsp(text || "Итоги уже известны. Откройте их, чтобы узнать, повезло ли вам.")}
          </p>
        </div>
        <Button onClick={open}>Открыть итоги</Button>
      </div>
    </div>,
    document.body,
  );
}

export default PastDay;
