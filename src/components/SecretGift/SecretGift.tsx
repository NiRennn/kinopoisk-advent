import { useState } from "react";
import { createPortal } from "react-dom";
import "./SecretGift.scss";
import Button from "../Button/Button";
import logo from "../../assets/icons/kinopoisk.svg";
import station from "../../assets/images/cells/ice-yandex1.png";
import phone from "../../assets/images/cells/ice-iphone1.png";
import hlop from "../../assets/icons/hlop.svg";

type SecretGiftProps = {
  joined: boolean;
  title: string;
  text: string;
  image?: string | null;
  resultsLabel: string;
  onJoin: () => void | Promise<void>;
  onClose: () => void;
};

function SecretGift({ joined, title, text, image, resultsLabel, onJoin, onClose }: SecretGiftProps) {
  const [closing, setClosing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async () => {
    if (closing || joining) return;
    if (!joined) {
      setJoining(true);
      setError("");
      try {
        await onJoin();
      } catch {
        setError("Не получилось принять участие");
      } finally {
        setJoining(false);
      }
      return;
    }
    setClosing(true);
  };

  return createPortal(
    <div
      className={`secret${joined ? " secret--joined" : ""}${closing ? " secret--closing" : ""}`}
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
      <div className="secret__veil" />
      <div className="secret__texture" />

      <img className="secret__logo" src={logo} alt="Кинопоиск" />

      <div className="secret__toast">
        <img src={phone} alt="" />
        <p>
          +1 Шанс на розыгрыш
          <br />
          iPhone Duo
        </p>
      </div>

      <div className="secret__body">
        <img className="secret__prize" src={image || station} alt="" />
        <div className="secret__copy">
          <h1 className="secret__title">
            {title.split("\n").map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p className="secret__text">{text}</p>
        </div>
      </div>

      <div className="secret__footer">
        <div className="secret__status">
          <div className="secret__status-copy">
            <p>Вы участвуете!</p>
            <span>{resultsLabel}</span>
          </div>
          <img src={hlop} alt="" />
        </div>
        {error && <p className="secret__error">{error}</p>}
        <Button
          variant={joined ? "secondary" : "primary"}
          loading={joining}
          onClick={handleAction}
        >
          {joined ? "Закрыть" : "Участвовать"}
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export default SecretGift;
