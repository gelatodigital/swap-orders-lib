import { gql } from "graphql-request";

export const GET_RANGE_ORDER_BY_TOKEN_ID = gql`
  query getRangeOrderByTokenId($tokenId: ID) {
    rangeOrders(where: { id: $tokenId }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      startTime
      expiryTime
      amountIn
      receiver
      feeToken
      resolver
      maxFeeAmount
      feeAmount
      amount0
      amount1
      pool
      submittedTxHash
      executedTxHash
      cancelledTxHash
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
      updatedAtBlockHash
    }
  }
`;

export const GET_OPEN_RANGE_ORDER_BY_RECEIVER = gql`
  query getOpenRangeOrderByUser($receiver: ID) {
    rangeOrders(where: { receiver: $receiver, status: submitted }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      startTime
      expiryTime
      amountIn
      receiver
      feeToken
      resolver
      maxFeeAmount
      feeAmount
      amount0
      amount1
      pool
      submittedTxHash
      executedTxHash
      cancelledTxHash
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
      updatedAtBlockHash
    }
  }
`;

export const GET_EXECUTED_RANGE_ORDER_BY_RECEIVER = gql`
  query getExecutedRangeOrderByUser($receiver: ID) {
    rangeOrders(where: { receiver: $receiver, status: executed }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      startTime
      expiryTime
      amountIn
      receiver
      feeToken
      resolver
      maxFeeAmount
      feeAmount
      amount0
      amount1
      pool
      submittedTxHash
      executedTxHash
      cancelledTxHash
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
      updatedAtBlockHash
    }
  }
`;

export const GET_CANCELLED_RANGE_ORDER_BY_RECEIVER = gql`
  query getCancelledRangeOrderByUser($receiver: ID) {
    rangeOrders(where: { receiver: $receiver, status: cancelled }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      startTime
      expiryTime
      amountIn
      receiver
      feeToken
      resolver
      maxFeeAmount
      feeAmount
      amount0
      amount1
      pool
      submittedTxHash
      executedTxHash
      cancelledTxHash
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
      updatedAtBlockHash
    }
  }
`;

export const GET_EXPIRED_RANGE_ORDER_BY_RECEIVER = gql`
  query getCancelledRangeOrderByUser($receiver: ID) {
    rangeOrders(where: { receiver: $receiver, status: expired }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      startTime
      expiryTime
      amountIn
      receiver
      feeToken
      resolver
      maxFeeAmount
      feeAmount
      amount0
      amount1
      pool
      submittedTxHash
      executedTxHash
      cancelledTxHash
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
      updatedAtBlockHash
    }
  }
`;
