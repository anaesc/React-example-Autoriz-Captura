import React, { useState, useRef } from "react";
import { Kushki } from "@kushki/js";
import Button from "./Button";
import CardForm from "./CardForm";
import testCards from "./utils/testCards";
import axios from "axios";

import "normalize.css";
import "./styles.scss";

type Inputs = {
  cardNumber: string;
  cardName: string;
  expDate: string;
  cvc: string;
};

const chargeAmount = 49.99;
const chargeCurrency = "USD";
const KUSHKI_PUBLIC_MERCHANT_ID = "20000000106212540000";

const exampleAPI = axios.create({
  baseURL: "https://kushki-backend-examples.vercel.app/api"
});

export default function App() {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [captureLoading, setCaptureLoading] = useState<boolean>(false);
  const [voidLoading, setVoidLoading] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<any | undefined>(undefined);
  const [captureSuccess, setCaptureSuccess] = useState<any | undefined>(
    undefined
  );
  const [voidSuccess, setVoidSuccess] = useState<any | undefined>(undefined);

  const kushki = new Kushki({
    merchantId: KUSHKI_PUBLIC_MERCHANT_ID,
    inTestEnvironment: true
  });

  const cardFormRef = useRef<any>();

  const setValues = (
    type: "approved" | "declinedOnToken" | "declinedOnAuth"
  ) => {
    cardFormRef.current.setValues(
      testCards[type].cardNumber,
      testCards[type].cardName,
      testCards[type].expDate,
      testCards[type].cvc
    );
  };

  const onSubmit = (data: Inputs) => {
    setLoading(true);
    setError(undefined);
    setToken("");

    kushki.requestToken(
      {
        amount: chargeAmount,
        currency: chargeCurrency,
        card: {
          name: data.cardName,
          number: data.cardNumber.replace(/ /g, ""),
          cvc: data.cvc,
          expiryMonth: data.expDate.split("/")[0],
          expiryYear: data.expDate.split("/")[1]
        }
      },
      (response: any) => {
        if (!response.code) {
          setToken(response.token);

          //Check our backend example: https://github.com/MatiMenich/kushki-backend-examples/blob/master/api/cards.js
          exampleAPI
            .post("/auth", {
              amount: chargeAmount,
              token: response.token
            })
            .then((response) => {
              console.log(response.data);
              setAuthSuccess(response.data);
            })
            .catch((error) => {
              if (error.response) {
                setError(error.response.data.message);
              } else {
                console.error(error);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
          setError(response.message);
        }
      }
    );
  };

  const captureTransaction = () => {
    setCaptureLoading(true);
    const ticketNumber = authSuccess ? authSuccess.ticketNumber : "";
    exampleAPI
      .post("/capture", {
        amount: chargeAmount,
        ticketNumber: ticketNumber
      })
      .then((response) => {
        console.log(response.data);
        setCaptureSuccess(response.data);
      })
      .catch((error) => {
        if (error.response) {
          setError(error.response.data.message);
        } else {
          console.error(error);
        }
      })
      .finally(() => {
        setCaptureLoading(false);
      });
  };

  const voidTransaction = () => {
    setVoidLoading(true);
    const ticketNumber = authSuccess ? authSuccess.ticketNumber : "";
    exampleAPI
      .post("/void", {
        amount: chargeAmount,
        ticketNumber: ticketNumber
      })
      .then((response) => {
        console.log(response.data);
        setVoidSuccess(response.data);
      })
      .catch((error) => {
        if (error.response) {
          setError(error.response.data.message);
        } else {
          console.error(error);
        }
      })
      .finally(() => {
        setVoidLoading(false);
      });
  };

  const resetExample = () => {
    setAuthSuccess(undefined);
    setCaptureSuccess(undefined);
    setVoidSuccess(undefined);
    setToken("");
  };

  return (
    <>
      {!authSuccess ? (
        <>
          <CardForm
            loading={loading}
            onSubmit={onSubmit}
            chargeAmount={chargeAmount}
            ref={cardFormRef}
          />

          <div className="text-center">
            <div className="test-data">
              <span className="test-data__title">Datos de prueba</span>
              <Button
                className="option-button"
                onClick={() => setValues("approved")}
              >
                Transacción aprobada
              </Button>
              <Button
                className="option-button"
                onClick={() => setValues("declinedOnToken")}
              >
                Transacción declinada en solicitud de token
              </Button>
              <Button
                className="option-button"
                onClick={() => setValues("declinedOnAuth")}
              >
                Transacción declinada en autorización
              </Button>
            </div>

            {token && (
              <div style={{ marginTop: "1rem" }}>
                <b>Token obtenido:</b> {token}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="success-wrapper">
          <div className="success-icon">✓</div>
          <p className="success-title">
            {authSuccess && !captureSuccess && !voidSuccess
              ? "Autorización"
              : captureSuccess
              ? "Captura"
              : "Anulación"}{" "}
            exitosa
          </p>
          <pre className="success-code">
            <code>{JSON.stringify(authSuccess, null, 2)}</code>
          </pre>
          {!voidSuccess && !captureSuccess && !voidLoading && (
            <Button
              loading={captureLoading}
              className="option-button"
              onClick={captureTransaction}
            >
              Capturar monto
            </Button>
          )}
          {!voidSuccess && !captureSuccess && !captureLoading && (
            <Button
              loading={voidLoading}
              className="option-button"
              onClick={voidTransaction}
              disabled={captureLoading}
            >
              Anular transacción
            </Button>
          )}

          {captureSuccess && (
            <pre className="success-code">
              <code>{JSON.stringify(captureSuccess, null, 2)}</code>
            </pre>
          )}
          {voidSuccess && (
            <pre className="success-code">
              <code>{JSON.stringify(voidSuccess, null, 2)}</code>
            </pre>
          )}
          {!voidLoading && !captureLoading && (
            <Button
              className="option-button"
              onClick={resetExample}
              disabled={captureLoading || voidLoading}
            >
              Reiniciar ejemplo
            </Button>
          )}
        </div>
      )}
      {error && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <b className="text-red">Error:</b> {error}
        </div>
      )}
    </>
  );
}
