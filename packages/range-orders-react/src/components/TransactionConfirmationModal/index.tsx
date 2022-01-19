import React from "react";
import { Currency } from "@uniswap/sdk-core";
import styled from "styled-components";
import { getExplorerLink, ExplorerDataType } from "../../utils/getExplorerLink";
import Modal from "../Modal";
import { ExternalLink } from "../../theme";
import { Text } from "rebass";
import { CloseIcon } from "../../theme/components";
import { RowBetween } from "../Row";
import { AlertTriangle, ArrowUpCircle } from "react-feather";
import { ButtonPrimary } from "../Button";
import { AutoColumn, ColumnCenter } from "../Column";
import { useWeb3 } from "../../web3";
import useTheme from "../../hooks/useTheme";
import Loader from "../Loader";

const Wrapper = styled.div`
  width: 100%;
  padding: 1rem;
`;
const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? "0" : "0")};
`;

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? "20px 0" : "60px 0;")};
`;

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void;
  pendingText: string;
  inline?: boolean; // not in modal
}) {
  return (
    <Wrapper>
      <AutoColumn gap="md">
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          {/* <CustomLightSpinner
            src={Circle}
            alt="loader"
            size={inline ? "40px" : "90px"}
          /> */}
          <Loader size="56px" />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={"center"}>
          <Text fontWeight={500} fontSize={20} textAlign="center">
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={"center"}>
            <Text fontWeight={600} fontSize={14} color="" textAlign="center">
              {pendingText}
            </Text>
          </AutoColumn>
          <Text
            fontSize={12}
            color="#565A69"
            textAlign="center"
            marginBottom={12}
          >
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  );
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  inline,
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: number;
  currencyToAdd?: Currency | undefined;
  inline?: boolean; // not in modal
}) {
  const theme = useTheme();

  return (
    <Wrapper>
      <Section inline={inline}>
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <ArrowUpCircle
            strokeWidth={0.5}
            size={inline ? "40px" : "90px"}
            color={theme.primary1}
          />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={"center"}>
          <Text fontWeight={500} fontSize={20} textAlign="center">
            Transaction Submitted
          </Text>
          {chainId && hash && (
            <ExternalLink
              href={getExplorerLink(
                chainId,
                hash,
                ExplorerDataType.TRANSACTION
              )}
            >
              <Text fontWeight={500} fontSize={14} color={theme.primary1}>
                View on Block Explorer
              </Text>
            </ExternalLink>
          )}

          <ButtonPrimary onClick={onDismiss} style={{ margin: "20px 0 0 0" }}>
            <Text fontWeight={500} fontSize={20}>
              {inline ? "Return" : "Close"}
            </Text>
          </ButtonPrimary>
        </AutoColumn>
      </Section>
    </Wrapper>
  );
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: string;
  onDismiss: () => void;
  topContent: () => React.ReactNode;
  bottomContent?: () => React.ReactNode | undefined;
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      {bottomContent && (
        <BottomSection gap="12px">{bottomContent()}</BottomSection>
      )}
    </Wrapper>
  );
}

export function TransactionErrorContent({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            Error
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn
          style={{ marginTop: 20, padding: "2rem 0" }}
          gap="24px"
          justify="center"
        >
          <AlertTriangle
            color={theme.red1}
            style={{ strokeWidth: 1.5 }}
            size={64}
          />
          <Text
            fontWeight={500}
            fontSize={16}
            color={theme.red1}
            style={{
              textAlign: "center",
              width: "85%",
              wordBreak: "break-word",
            }}
          >
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => React.ReactNode;
  attemptingTxn: boolean;
  pendingText: string;
  currencyToAdd?: Currency | undefined;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}: ConfirmationModalProps) {
  const { chainId } = useWeb3();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent
          onDismiss={onDismiss}
          pendingText={pendingText}
        />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content()
      )}
    </Modal>
  );
}
