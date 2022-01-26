import React, { Fragment, useCallback } from "react";
import { Text } from "rebass";
import { ButtonError } from "../Button";
import { SwapCallbackError } from "../order/styleds";
import { AutoRow } from "../Row";
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from "../TransactionConfirmationModal";

function CancellationModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  disabledConfirm: boolean;
}) {
  return (
    <Fragment>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: "10px 0 0 0" }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={16} fontWeight={300}>
            Cancel Order
          </Text>
        </ButtonError>

        {swapErrorMessage ? (
          <SwapCallbackError error={swapErrorMessage} />
        ) : null}
      </AutoRow>
    </Fragment>
  );
}

export default function ConfirmCancellationModal({
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  topContent,
}: {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash: string | undefined;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onDismiss: () => void;
  topContent: () => React.ReactNode;
}) {
  const showAcceptChanges = false;

  const modalBottom = useCallback(() => {
    return (
      <CancellationModalFooter
        onConfirm={onConfirm}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
      />
    );
  }, [onConfirm, showAcceptChanges, swapErrorMessage]);

  // text to show while loading
  const pendingText = `Cancelling order...`;

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent
          onDismiss={onDismiss}
          message={swapErrorMessage}
        />
      ) : (
        <ConfirmationModalContent
          title="Cancel Order"
          onDismiss={onDismiss}
          topContent={topContent}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, swapErrorMessage, topContent]
  );

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  );
}
