import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useTelegramBackButton } from "../../utils/telegramBack";
import { createPortal } from "react-dom";
import "./Result.scss";
import Button from "../Button/Button";
import logo from "../../assets/icons/kinopoisk.svg";
import check from "../../assets/icons/check.svg";
import cubes from "../../assets/images/cells/cubes-123.png";
import { ApiError } from "../../api/client";
import type { Fact, Prize, WinnerForm } from "../../api/types";
import { formatDayMonth, resultsWhen } from "../../advent/format";
import { formatNbsp } from "../../utils/typography";
import { revealResult } from "../../utils/motion";

export type ResultOutcome = "win" | "lose" | "missed";

type ResultProps = {
  date: string;
  outcome: ResultOutcome;
  fact?: Fact | null;
  prizeTitle?: string | null;
  prizeText?: string | null;
  prizeImage?: string | null;
  prizeType?: Prize["type"] | null;
  formRequired?: boolean;
  formFilled?: boolean;
  promoCode?: string | null;
  promoTerms?: string | null;
  resultsAt?: string | null;
  resultsPublished?: boolean;
  onSubmit?: (form: WinnerForm) => Promise<void>;
  onClose: () => void;
};

const FAIL_TITLES: Record<Exclude<ResultOutcome, "win">, string[]> = {
  lose: ["Увы, сегодня", "не повезло..."],
  missed: ["Вы не успели", "открыть этот день"],
};

const FAIL_LEAD: Record<Exclude<ResultOutcome, "win">, string> = {
  lose: formatNbsp("Сегодня удача улыбнулась кому-то другому. Но этот день тоже может подарить эмоции — вот одна из самых ярких историй этого спортивного года."),
  missed: formatNbsp("Прием заявок на этот день завершен. Зато впереди еще новые подарки!"),
};

function Result({
  date,
  outcome,
  fact,
  prizeTitle,
  // prizeText,
  prizeImage,
  prizeType,
  formRequired = true,
  formFilled = false,
  promoCode,
  promoTerms,
  resultsAt,
  resultsPublished = false,
  onSubmit,
  onClose,
}: ResultProps) {
  const [sent, setSent] = useState(formFilled);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [consent, setConsent] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useTelegramBackButton(onClose);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timeline = revealResult(root);
    return () => {
      timeline.kill();
    };
  }, []);

  const ready =
    name.trim() !== "" &&
    contact.trim() !== "" &&
    city.trim() !== "" &&
    address.trim() !== "" &&
    consent;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready || sending) return;
    if (!onSubmit) {
      setSent(true);
      return;
    }
    setSending(true);
    setError("");
    try {
      await onSubmit({
        full_name: name.trim(),
        contact: contact.trim(),
        city: city.trim(),
        address: address.trim(),
        consent,
      });
      setSent(true);
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "already_filled") {
        setSent(true);
      } else if (reason instanceof ApiError && reason.code === "expired") {
        setError("Срок заполнения анкеты истёк");
      } else if (reason instanceof ApiError && reason.code === "fields_required") {
        setError("Заполните все поля");
      } else if (reason instanceof ApiError && reason.code === "consent_required") {
        setError("Нужно согласие на обработку данных");
      } else {
        setError("Не получилось отправить анкету");
      }
    } finally {
      setSending(false);
    }
  };

  const digital = prizeType === "digital" || (Boolean(promoCode) && !formRequired);
  const title = prizeTitle?.trim() || "";
  const conditions = promoTerms?.trim() || "";

  const copyCode = async () => {
    if (!promoCode) return;
    try {
      await navigator.clipboard.writeText(promoCode);
    } catch {
      const input = document.createElement("textarea");
      input.value = promoCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const fail = outcome === "lose" || outcome === "missed";

  const factUrl = fact?.product_url?.trim() || fact?.url?.trim();

  const hasFact = Boolean(
    fact?.title || fact?.text || fact?.image || factUrl
  );
  const showDate = outcome !== "missed" || resultsPublished;

  return createPortal(
    <div
      ref={rootRef}
      className={`result result--${outcome}${sent ? " result--sent" : ""}${digital ? " result--promo" : ""}`}
    >
      <div className="result__hero">
        {outcome === "win" && <img className="result__logo" src={logo} alt="Кинопоиск" />}
        {outcome === "win" && !digital && prizeImage && <img className="result__prize" src={prizeImage} alt="" />}
        {showDate && <p className="result__date">{formatNbsp(`Итоги розыгрыша от ${formatDayMonth(date)}`)}</p>}
        {outcome === "win" ? (
          digital ? (
            <>
              {/* <h1 className="result__headline">{formatNbsp(title || "Вы выиграли!")}</h1> */}
              <h1 className="result__headline">
                Подписка
                <br />
                {formatNbsp("«Матч Максимум» — ваша!")}
              </h1>              <p className="result__lead">
                {formatNbsp(
                  title
                    ? `Поздравляем! Промокод на подписку «Матч Максимум» уже доступен. Скопируйте код и активируйте подписку по инструкции`
                    : "Поздравляем! Промокод уже доступен. Скопируйте код и активируйте подписку по инструкции",
                )}
              </p>
            </>
          ) : (
            <h1 className="result__headline">Вы выиграли!</h1>
          )
        ) : (
          <>
            <h1 className="result__headline">
              {FAIL_TITLES[outcome][0]}
              <br />
              {FAIL_TITLES[outcome][1]}
            </h1>
            <p className="result__lead">{FAIL_LEAD[outcome]}</p>
            {outcome === "missed" && !resultsPublished && (
              <p className="result__when">
                {formatNbsp(`Итоги розыгрыша — ${resultsWhen(resultsAt ?? null) || "скоро"}`)}
              </p>
            )}
          </>
        )}
      </div>

      {outcome === "win" && !digital && !sent && (
        <form className="result__sheet" onSubmit={submit}>
          <div className="result__intro">
            <h2>{title ? <>Ваш приз —<br />{title}</> : "Ваш приз"}</h2>
            <p>{formatNbsp("Поздравляем! Укажите данные, чтобы мы могли связаться с вами и отправить подарок")}</p>
          </div>

          <label className="result__field">
            <span>
              Ваше полное ФИО <i>*</i>
            </span>
            <input
              value={name}
              placeholder="Иванов Иван Иванович"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="result__field">
            <span>
              Контакт для связи <i>*</i>
            </span>
            <input
              value={contact}
              placeholder="Телефон, E-mail, Telegram, MAX"
              onChange={(event) => setContact(event.target.value)}
            />
          </label>
          <label className="result__field">
            <span>
              Город получения <i>*</i>
            </span>
            <input
              value={city}
              placeholder="Москва"
              onChange={(event) => setCity(event.target.value)}
            />
          </label>
          <label className="result__field">
            <span>
              Адрес получения <i>*</i>
            </span>
            <input
              value={address}
              placeholder="Пушкина 13, кв 17"
              onChange={(event) => setAddress(event.target.value)}
            />
          </label>

          <div className="result__consent">
            <button
              type="button"
              className={`result__switch${consent ? " result__switch--on" : ""}`}
              role="switch"
              aria-checked={consent}
              aria-label="Принимаю условия обработки персональных данных"
              onClick={() => setConsent((value) => !value)}
            />
            <p>
              Принимаю{" "}
              <a href="https://ya.ru/" target="_blank" rel="noopener noreferrer">
                условия обработки персональных данных
              </a>
            </p>
          </div>

          {error && <p className="result__error">{error}</p>}
          <Button type="submit" disabled={!ready} loading={sending}>
            Отправить заявку
          </Button>
        </form>
      )}

      {outcome === "win" && digital && (
        <div className="result__sheet result__sheet--promo">
          <div className="result__promo">
            <h2>Ваш промокод</h2>

            {conditions && (
              <p>
                {formatNbsp(`Срок действия и условия активации: ${conditions}`)}
              </p>
            )}

            {promoCode && (
              <button
                type="button"
                className="result__codebox"
                onClick={copyCode}
              >
                {copied ? "Скопировано" : promoCode}
              </button>
            )}
          </div>

          <div className="result__promo-actions">
            {promoCode && (
              <Button onClick={copyCode}>Скопировать код</Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      )}

      {outcome === "win" && sent && !digital && (
        <div className="result__sheet result__sheet--sent">
          <div className="result__sent">
            <img src={check} alt="" />
            <h2>Анкета отправлена!</h2>
            <p>{formatNbsp("Спасибо! Данные для получения приза сохранены. Если понадобятся уточнения, с вами свяжутся.")}</p>
          </div>
          <Button onClick={onClose}>К календарю</Button>
        </div>
      )}

      {fail && hasFact && (
        <div className="result__card">
          <div className="result__chip">Интересный факт</div>
          <img className="result__cubes" src={fact?.image || cubes} alt="" />
          {fact?.title && (
            <h2 className="result__fact-title">
              {fact.title.split("\n").map((line, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {formatNbsp(line)}
                </span>
              ))}
            </h2>
          )}
          {fact?.text && <p className="result__fact-text">{formatNbsp(fact.text)}</p>}
          {factUrl && (
            <a
              className="result__fact-link"
              href={factUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                const tg = window.Telegram?.WebApp;

                if (typeof tg?.openLink === "function") {
                  event.preventDefault();
                  tg.openLink(factUrl);
                }
              }}
            >
              {factUrl}
            </a>
          )}
          <Button onClick={onClose}>{outcome === "missed" ? "К календарю" : "К Адвенту"}</Button>
        </div>
      )}

      {fail && !hasFact && (
        <div className="result__actions">
          <Button onClick={onClose}>{outcome === "missed" ? "К календарю" : "К Адвенту"}</Button>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default Result;
