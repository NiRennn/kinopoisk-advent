import { useState } from "react";
import { useTelegramBackButton } from "../../utils/telegramBack";
import { createPortal } from "react-dom";
import "./SecretGift.scss";
import Button from "../Button/Button";
import logo from "../../assets/icons/kinopoisk.svg";
import station from "../../assets/images/cells/ice-yandex1.png";
import phone from "../../assets/images/cells/ice-iphone1.png";
import hlop from "../../assets/icons/hlop.svg";
import { alreadyCopy, joinedCopy, prizeCase, resultsDraw } from "../../advent/format";
import { formatNbsp } from "../../utils/typography";

type SecretGiftProps = {
  joined: boolean;
  title: string;
  titleAcc?: string | null;
  titleGen?: string | null;
  text: string;
  image?: string | null;
  resultsLabel: string;
  resultsAt?: string | null;
  onJoin: () => void | Promise<void>;
  onClose: () => void;
};

function SecretGift({ joined, title, titleAcc, titleGen, image, resultsLabel, resultsAt, onJoin, onClose }: SecretGiftProps) {
  const [closing, setClosing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState("");
  const returning = joined && !celebrating;
  const titleInAccusative = prizeCase(title, titleAcc);
  const titleInGenitive = prizeCase(title, titleGen);

  const close = () => {
    if (closing || joining) return;
    setClosing(true);
  };
  useTelegramBackButton(close);

  const handleAction = async () => {
    if (closing || joining) return;
    if (!joined && !celebrating) {
      setJoining(true);
      setError("");
      try {
        await onJoin();
        setCelebrating(true);
      } catch {
        setError("Не получилось принять участие");
      } finally {
        setJoining(false);
      }
      return;
    }
    close();
  };

  return createPortal(
    <div
      className={`secret${celebrating ? " secret--joined" : ""}${closing ? " secret--closing" : ""}`}
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
            {celebrating ? "Вы участвуете!" : returning ? "Вы уже участвуете" : (
              <>
                Подарок дня —<br />
                {title.split("\n").map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index > 0 && <br />}
                    {formatNbsp(line)}
                  </span>
                ))}
              </>
            )}
          </h1>
          <p className="secret__text">
            {celebrating
              ? joinedCopy(titleInGenitive, resultsAt ?? null)
              : returning
                ? alreadyCopy(resultsAt ?? null)
                : <>{formatNbsp(`Сегодня можно выиграть ${titleInAccusative}.`)} {formatNbsp(`Итоги розыгрыша — ${resultsDraw(resultsAt ?? null)}. Для участия достаточно нажать кнопку ниже`)}</>}
          </p>
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
          variant={joined || celebrating ? "secondary" : "primary"}
          loading={joining}
          onClick={handleAction}
        >
          {joined || celebrating ? "Вернуться в календарь" : "Участвовать"}
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export default SecretGift;
