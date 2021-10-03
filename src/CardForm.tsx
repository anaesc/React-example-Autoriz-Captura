import React, {
  forwardRef,
  useImperativeHandle,
  RefForwardingComponent
} from "react";

import IMask from "imask";
import { IMaskInput } from "react-imask";
import { useForm } from "react-hook-form";
import luhn from "luhn";
import { getCardTypeByValue } from "./utils/cardTypes";
import { validateDate } from "./utils/validateDate";
import CardTypeDisplay from "./CardTypeDisplay";
import Button from "./Button";
import logoKushkiImg from "./images/logokushki";

type Inputs = {
  cardNumber: string;
  cardName: string;
  expDate: string;
  cvc: string;
};

interface CardFormProps {
  onSubmit: (data: Inputs) => void;
  loading?: boolean;
  chargeAmount: number;
}

type CardFormHandle = {
  setValues: (
    cardNumber: string,
    cardName: string,
    expDate: string,
    cvc: string
  ) => void;
  reset: () => void;
};

const CardForm: RefForwardingComponent<CardFormHandle, CardFormProps> = (
  { onSubmit, loading, chargeAmount },
  ref
) => {
  const { register, handleSubmit, watch, errors, setValue, reset } = useForm<
    Inputs
  >();

  const card = getCardTypeByValue(watch("cardNumber"));

  useImperativeHandle(ref, () => ({
    reset() {
      reset();
    },
    setValues(cardNumber, cardName, expDate, cvc) {
      setValue("cardNumber", cardNumber);
      setValue("cardName", cardName);
      setValue("expDate", expDate);
      setValue("cvc", cvc);
    }
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-form">
      <div className="form-group">
        <IMaskInput
          mask={"0000 0000 0000 0000"}
          unmask={true}
          name="cardNumber"
          placeholder="Número de tarjeta"
          autoComplete="cc-number"
          inputRef={register({
            required: "Número de tarjeta requerido",
            pattern: {
              value: /[\d| ]{16,22}/,
              message: "Número de tarjeta incompleto"
            },
            validate: (value: string) =>
              luhn.validate(value) || "Número de tarjeta incorrecto"
          })}
          className={`form-input ${
            errors.cardNumber ? "form-input--error" : ""
          }`}
        />
        <CardTypeDisplay
          cards={["visa", "mastercard", "amex", "diners"]}
          selected={card && card.type}
        />
        {errors.cardNumber && (
          <span className="error-display">{errors.cardNumber.message}</span>
        )}
      </div>

      <div className="form-group">
        <input
          name="cardName"
          placeholder="Nombre"
          autoComplete="cc-name"
          ref={register({
            required: true
          })}
          className={`form-input ${errors.cardName ? "form-input--error" : ""}`}
        />
        {errors.cardName && (
          <span className="error-display">El nombre es requerido</span>
        )}
      </div>

      <div className="input-group">
        <div className="form-group">
          <IMaskInput
            mask={"MM/YY"}
            blocks={{
              YY: {
                mask: "00"
              },
              MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12
              }
            }}
            unmask={false}
            name="expDate"
            placeholder="MM/YY"
            autoComplete="cc-exp"
            inputRef={register({
              required: "Expiración requerida",
              pattern: {
                value: /\d\d\/\d\d/,
                message: "Expiración incorrecta"
              },
              validate: (value: string) =>
                validateDate(value) || "Expiración vencida"
            })}
            className={`form-input ${
              errors.expDate ? "form-input--error" : ""
            }`}
          />
          {errors.expDate && (
            <span className="error-display">{errors.expDate.message}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="cvc"
            placeholder={card ? card.code.name : "CVC"}
            autoComplete="cc-csc"
            ref={register({
              required: true,
              pattern: /\d{3,4}/
            })}
            className={`form-input ${errors.cvc ? "form-input--error" : ""}`}
          />
          {errors.cvc && (
            <span className="error-display">CVC está incompleto</span>
          )}
        </div>
      </div>

      <Button type="submit" className="form-submit-button" loading={loading}>
        Pagar ${chargeAmount}
      </Button>

      <div className="text-center">{logoKushkiImg}</div>
    </form>
  );
};

export default forwardRef(CardForm);
