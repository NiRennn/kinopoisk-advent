import { useState } from "react";
import { createPortal } from "react-dom";
import "./Onboarding.scss";
import cubes from "../../assets/images/cubes.png";
import logo from "../../assets/icons/kinopoisk.svg";
import Button from "../Button/Button";

type OnboardingProps = {
  onClose: () => void;
};

function Onboarding({ onClose }: OnboardingProps) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
  };

  return createPortal(
    <div
      className={`onboarding${closing ? " onboarding--closing" : ""}`}
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
      <div className="onboarding__veil" /> 
      <div className="onboarding__mask" />

      <img className="onboarding__logo" src={logo} alt="Кинопоиск" />

      <div className="onboarding__body">
        <img className="onboarding__cubes" src={cubes} alt="" />
        <div className="onboarding__copy">
          <h1 className="onboarding__title">
            Месяц подарков
          </h1>
          <p className="onboarding__text">
            Вспоминайте главные спортивные моменты года и участвуйте в розыгрышах каждый день. Каждое участие в новой ячейке добавляет шанс выиграть iPhone Duo 31 декабря.
          </p>
        </div>
      </div>


      <Button variant="primary" onClick={close}>Открыть календарь</Button>
    </div>,
    document.body,
  );
}

export default Onboarding;
