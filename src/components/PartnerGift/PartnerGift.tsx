import { useState } from "react";
import { createPortal } from "react-dom";
import "../SecretGift/SecretGift.scss";
import "./PartnerGift.scss";
import Button from "../Button/Button";
import logo from "../../assets/icons/kinopoisk.svg";
import prize from "../../assets/images/cells/ice-zenit.png";
import phone from "../../assets/images/cells/ice-iphone1.png";
import hlop from "../../assets/icons/hlop.svg";
import info from "../../assets/icons/info-orange.svg";
import refresh from "../../assets/icons/sub-check.svg";
import { ApiError } from "../../api/client";

type PartnerStep = "subscribe" | "checking" | "failed" | "gift";

type PartnerGiftProps = {
  joined: boolean;
  title: string;
  text: string;
  image?: string | null;
  markImage?: string | null;
  resultsLabel: string;
  onSubscribe: () => void;
  onCheck: () => Promise<boolean>;
  onJoin: () => void | Promise<void>;
  onClose: () => void;
};

function PartnerGift({
  joined,
  title,
  text,
  image,
  markImage,
  resultsLabel,
  onSubscribe,
  onCheck,
  onJoin,
  onClose,
}: PartnerGiftProps) {
  const [step, setStep] = useState<PartnerStep>(joined ? "gift" : "subscribe");
  const [closing, setClosing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (closing) return;
    setClosing(true);
  };

  const check = async () => {
    if (step === "checking" || closing) return;
    setStep("checking");
    setError("");
    try {
      const ok = await onCheck();
      setStep(ok ? "gift" : "failed");
    } catch {
      setStep("failed");
    }
  };

  const join = async () => {
    if (joining || closing) return;
    setJoining(true);
    setError("");
    try {
      await onJoin();
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "not_subscribed_partner") {
        setStep("failed");
      } else {
        setError("Не получилось принять участие");
      }
    } finally {
      setJoining(false);
    }
  };

  const gift = step === "gift";

  return createPortal(
    <div
      className={`secret partner${gift && joined ? " secret--joined" : ""}${closing ? " secret--closing" : ""}`}
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

      {step === "failed" && (
        <div className="partner__alert">
          <img src={info} alt="" />
          <p>
            Подписка не найдена,
            <br />
            повторите попытку
          </p>
        </div>
      )}

      {gift && (
        <div className={`secret__toast${joined ? " partner__toast--in" : ""}`}>
          <img src={phone} alt="" />
          <p>
            +1 Шанс на розыгрыш
            <br />
            iPhone Duo
          </p>
        </div>
      )}

      {step === "checking" ? (
        <div className="partner__check">
          <img src={refresh} alt="" />
          <h1>Проверяем подписку...</h1>
        </div>
      ) : gift ? (
        <div className="secret__body">
          <img className="secret__prize" src={image || prize} alt="" />
          <div className="secret__copy">
            <h1 className="secret__title">{title}</h1>
            <p className="secret__text">{text}</p>
          </div>
        </div>
      ) : (
        <div className="secret__body">
          <div
            className={`partner__mark${markImage ? " partner__mark--photo" : ""}`}
            style={markImage ? { backgroundImage: `url("${markImage}")` } : undefined}
          />
          <div className="secret__copy">
            <h1 className="secret__title">
              Подпишитесь
              <br />
              на нашего партнера
            </h1>
            <p className="secret__text">{text}</p>
          </div>
        </div>
      )}

      <div className="secret__footer">
        {gift ? (
          <>
            <div className={`secret__status${joined ? " partner__status--in" : ""}`}>
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
              onClick={joined ? close : join}
            >
              {joined ? "Закрыть" : "Участвовать"}
            </Button>
          </>
        ) : (
          <div className="partner__actions">
            <Button onClick={onSubscribe}>Подписаться</Button>
            <Button variant="secondary" onClick={check}>
              Проверить подписку
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default PartnerGift;
