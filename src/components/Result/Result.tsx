import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import "./Result.scss";
import Button from "../Button/Button";
import logo from "../../assets/icons/kinopoisk.svg";
import check from "../../assets/icons/check.svg";
import station from "../../assets/images/cells/ice-yandex1.png";
import cubes from "../../assets/images/cells/cubes-123.png";
import { ApiError } from "../../api/client";
import type { Fact, WinnerForm } from "../../api/types";
import { formatDayMonth } from "../../advent/format";

export type ResultOutcome = "win" | "lose" | "missed";

type ResultProps = {
  date: string;
  outcome: ResultOutcome;
  fact?: Fact | null;
  prizeImage?: string | null;
  formRequired?: boolean;
  formFilled?: boolean;
  promoCode?: string | null;
  onSubmit?: (form: WinnerForm) => Promise<void>;
  onClose: () => void;
};

const FAIL_TITLES: Record<Exclude<ResultOutcome, "win">, string[]> = {
  lose: ["Увы, сегодня", "не повезло..."],
  missed: ["Вы не успели", "открыть этот день"],
};

function Result({
  date,
  outcome,
  fact,
  prizeImage,
  formRequired = true,
  formFilled = false,
  promoCode,
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

  const showPromo = Boolean(promoCode) && !formRequired;

  const fail = outcome === "lose" || outcome === "missed";

  return createPortal(
    <div className={`result result--${outcome}${sent ? " result--sent" : ""}`}>
      <div className="result__hero">
        {outcome === "win" && <img className="result__logo" src={logo} alt="Кинопоиск" />}
        {outcome === "win" && <img className="result__prize" src={prizeImage || station} alt="" />}
        <p className="result__date">Итоги розыгрыша от {formatDayMonth(date)}</p>
        {outcome === "win" ? (
          <h1 className="result__headline">Вы победитель!</h1>
        ) : (
          <h1 className="result__headline">
            {FAIL_TITLES[outcome][0]}
            <br />
            {FAIL_TITLES[outcome][1]}
          </h1>
        )}
      </div>

      {outcome === "win" && !sent && !showPromo && (
        <form className="result__sheet" onSubmit={submit}>
          <div className="result__intro">
            <h2>Анкета победителя</h2>
            <p>Оставьте ваши данные, чтобы мы могли отправить вам ваш приз</p>
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
              <span>условия обработки персональных данных</span>
            </p>
          </div>

          {error && <p className="result__error">{error}</p>}
          <Button type="submit" disabled={!ready} loading={sending}>
            Отправить заявку
          </Button>
        </form>
      )}

      {outcome === "win" && showPromo && (
        <div className="result__sheet result__sheet--sent">
          <div className="result__sent">
            <h2>Ваш промокод</h2>
            <p className="result__code">{promoCode}</p>
          </div>
          <Button onClick={onClose}>К Адвенту</Button>
        </div>
      )}

      {outcome === "win" && sent && !showPromo && (
        <div className="result__sheet result__sheet--sent">
          <div className="result__sent">
            <img src={check} alt="" />
            <h2>Анкета отправлена!</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur. Donec orci ullamcorper sed
              diam in massa. Faucibus ullamcorper ac consequat feugiat sit
              viverra fringilla feugiat. Dui id eu netus at neque amet.
            </p>
          </div>
          <Button onClick={onClose}>К Адвенту</Button>
        </div>
      )}

      {fail && (
        <div className="result__card"> 
          <div className="result__chip">Интересный факт</div>
          <img className="result__cubes" src={fact?.image || cubes} alt="" />
          <h2 className="result__fact-title">
            {(fact?.title || "Обратный отсчёт\nбыл настоящим").split("\n").map((line, index) => (
              <span key={index}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <p className="result__fact-text">
            {fact?.text ||
              "Перед стартом плей-офф КХЛ на Кинопоиске показали запуск корабля «Прогресс МС-33». В этот раз путь к Кубку Гагарина сопровождался настоящим полётом к звёздам."}
          </p>
          <Button onClick={onClose}>К Адвенту</Button>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default Result;
