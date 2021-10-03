import React from "react";

import Button from "./Button";

interface ResultProps {
  successType: "auth" | "capture" | "void";
  authPayload: object;
  capturePayload: object;
  voidPayload: object;
  loading: boolean;
  captureTransaction;
}

const Result: React.FC<ResultProps> = ({
  successType,
  authPayload,
  capturePayload,
  voidPayload,
  loading,
  captureLoading,
  voidLoading
}) => {
  const title =
    successType === "auth"
      ? "Authorización"
      : successType === "capture"
      ? "Captura"
      : successType === "void"
      ? "Void"
      : "";

  return (
    <div className="success-wrapper">
      <div className="success-icon">✓</div>
      <p className="success-title">{title} exitosa</p>
      <pre className="success-code">
        <code>{JSON.stringify(authPayload, null, 2)}</code>
      </pre>
      {!loading && (
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
  );
};
