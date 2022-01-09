import { gql } from "graphql-request";

export const GET_RANGE_ORDER_BY_TOKEN_ID = gql`
  query getRangeOrderByTokenId($tokenId: ID) {
    rangeOrders(where: { id: $tokenId }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      ejectDust
      amountIn
      amount0Min
      amount1Min
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

export const GET_OPEN_RANGE_ORDER_BY_CREATOR = gql`
  query getOpenRangeOrderByUser($creator: ID) {
    rangeOrders(where: { creator: $creator, status: submitted }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      ejectDust
      amountIn
      amount0Min
      amount1Min
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

export const GET_EXECUTED_RANGE_ORDER_BY_CREATOR = gql`
  query getExecutedRangeOrderByUser($creator: ID) {
    rangeOrders(where: { creator: $creator, status: executed }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      ejectDust
      amountIn
      amount0Min
      amount1Min
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

export const GET_CANCELLED_RANGE_ORDER_BY_CREATOR = gql`
  query getCancelledRangeOrderByUser($creator: ID) {
    rangeOrders(where: { creator: $creator, status: cancelled }) {
      id
      status
      creator
      tickThreshold
      zeroForOne
      ejectDust
      amountIn
      amount0Min
      amount1Min
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
