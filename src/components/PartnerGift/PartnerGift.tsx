import { useState } from "react";
import { createPortal } from "react-dom";
import "../SecretGift/SecretGift.scss";
import "./PartnerGift.scss";
import Button from "../Button/Button";
import logo from "../../assets/icons/kinopoisk.svg";
import iceZenit from "../../assets/images/cells/ice-zenit.png";
import station from "../../assets/images/cells/ice-yandex1.png";
import cellRfc from "../../assets/images/cells/cell-rfc1.png";
import cellKhl from "../../assets/images/cells/cell-khl1.png";
import cellRuspace from "../../assets/images/cells/cell-ruspace1.png";
import phone from "../../assets/images/cells/ice-iphone1.png";
import hlop from "../../assets/icons/hlop.svg";
import info from "../../assets/icons/info-orange.svg";
import refresh from "../../assets/icons/sub-check.svg";
import { ApiError } from "../../api/client";
import type { PartnerKey } from "../../advent/cells";
import { alreadyCopy, partnerOfferCopy, partnerSubscribeCopy } from "../../advent/format";

type PartnerStep = "subscribe" | "checking" | "failed" | "gift";

const MARK: Record<Exclude<PartnerKey, "zenit">, string> = {
  rfc: cellRfc,
  khl: cellKhl,
  ruspace: cellRuspace,
};

type PartnerGiftProps = {
  joined: boolean;
  title: string;
  partnerName?: string | null;
  mark?: PartnerKey | null;
  image?: string | null;
  resultsLabel: string;
  resultsAt?: string | null;
  onSubscribe: () => void;
  onCheck: () => Promise<boolean>;
  onJoin: () => void | Promise<void>;
  onClose: () => void;
};

function prizePicture(title: string, image: string | null | undefined, mark: PartnerKey | null) {
  if (mark === "zenit") return iceZenit;
  if (image) return image;
  if (/станц/i.test(title)) return station;
  if (mark) return MARK[mark];
  return station;
}

function PartnerGift({
  joined,
  title,
  partnerName,
  mark = null,
  image,
  resultsLabel,
  resultsAt,
  onSubscribe,
  onCheck,
  onJoin,
  onClose,
}: PartnerGiftProps) {
  const [step, setStep] = useState<PartnerStep>(joined ? "gift" : "subscribe");
  const [closing, setClosing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState("");
  const confirmed = joined || celebrating;
  const from = partnerName ? `Подарок от ${partnerName}` : "Подарок от партнера";

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
    if (joining || closing || confirmed) return;
    setJoining(true);
    setError("");
    try {
      await onJoin();
      setCelebrating(true);
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
  const markPhoto = mark && mark !== "zenit" ? MARK[mark] : null;

  return createPortal(
    <div
      className={`secret partner${gift && confirmed ? " secret--joined" : ""}${closing ? " secret--closing" : ""}`}
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
            Подписка на канал клуба-партнёра пока не найдена. Проверьте подписку и попробуйте ещё раз
          </p>
        </div>
      )}

      {gift && (
        <div className={`secret__toast${confirmed ? " partner__toast--in" : ""}`}>
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
          <div className="partner__hero">
            <img className="secret__prize" src={prizePicture(title, image, mark)} alt="" />
            {mark && (
              <div
                className={`partner__badge${markPhoto ? " partner__badge--photo" : ""}`}
                style={markPhoto ? { backgroundImage: `url("${markPhoto}")` } : undefined}
              />
            )}
          </div>
          <div className="secret__copy">
            <p className="partner__from">{from}</p>
            <h1 className="secret__title">{title}</h1>
            <p className="secret__text">
              {confirmed ? alreadyCopy(resultsAt ?? null) : partnerOfferCopy(title, resultsAt ?? null)}
            </p>
          </div>
        </div>
      ) : (
        <div className="secret__body">
          {mark && (
            <div
              className={`partner__mark${markPhoto ? " partner__mark--photo" : ""}`}
              style={markPhoto ? { backgroundImage: `url("${markPhoto}")` } : undefined}
            />
          )}
          <div className="secret__copy">
            <h1 className="secret__title">
              Подпишитесь на канал
              <br />
              клуба-партнера
            </h1>
            <p className="secret__text">{partnerSubscribeCopy(title, partnerName ?? null)}</p>
          </div>
        </div>
      )}

      <div className="secret__footer">
        {gift ? (
          <>
            <div className={`secret__status${confirmed ? " partner__status--in" : ""}`}>
              <div className="secret__status-copy">
                <p>Вы участвуете!</p>
                <span>{resultsLabel}</span>
              </div>
              <img src={hlop} alt="" />
            </div>
            {error && <p className="secret__error">{error}</p>}
            <Button
              variant={confirmed ? "secondary" : "primary"}
              loading={joining}
              onClick={confirmed ? close : join}
            >
              {confirmed ? "Закрыть" : "Участвовать"}
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
