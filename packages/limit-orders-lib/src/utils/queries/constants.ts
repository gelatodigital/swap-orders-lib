import { gql } from "graphql-request";

export const GET_ORDER_BY_ID = gql`
  query getOrdersByOwner($id: String) {
    orders(where: { id: $id }) {
      id
      owner
      inputToken
      outputToken
      minReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;

export const GET_ALL_ORDERS_BY_OWNER = gql`
  query getOrdersByOwner($owner: String) {
    orders(
      first: 1000
      orderBy: updatedAtBlock
      orderDirection: desc
      where: { owner: $owner }
    ) {
      id
      owner
      inputToken
      outputToken
      minReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;

export const GET_ALL_OPEN_ORDERS_BY_OWNER = gql`
  query getOpenOrdersByOwner($owner: String) {
    orders(
      first: 1000
      orderBy: updatedAtBlock
      orderDirection: desc
      where: { owner: $owner, status: open }
    ) {
      id
      owner
      inputToken
      outputToken
      minReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;

export const GET_ALL_PAST_ORDERS_BY_OWNER = gql`
  query getPastOrdersByOwner($owner: String) {
    orders(
      first: 1000
      orderBy: updatedAtBlock
      orderDirection: desc
      where: { owner: $owner, status_not: open }
    ) {
      id
      owner
      inputToken
      outputToken
      minReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;

export const GET_ALL_EXECUTED_ORDERS_BY_OWNER = gql`
  query getExecutedOrdersByOwner($owner: String) {
    orders(
      first: 1000
      orderBy: updatedAtBlock
      orderDirection: desc
      where: { owner: $owner, status: executed }
    ) {
      id
      owner
      inputToken
      outputToken
      minReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;

export const GET_ALL_CANCELLED_ORDERS_BY_OWNER = gql`
  query getCancelledOrdersByOwner($owner: String) {
    orders(
      first: 1000
      orderBy: updatedAtBlock
      orderDirection: desc
      where: { owner: $owner, status: cancelled }
    ) {
      id
      owner
      inputToken
      outputToken
      minReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;

export const GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER = gql`
  query getOrdersByOwner($owner: String, $module: String) {
    orders(
      first: 1000
      orderBy: updatedAtBlock
      orderDirection: desc
      where: { owner: $owner, module: $module }
    ) {
      id
      owner
      inputToken
      outputToken
      minReturn
      maxReturn
      module
      witness
      secret
      inputAmount
      vault
      bought
      auxData
      status
      createdTxHash
      executedTxHash
      cancelledTxHash
      blockNumber
      createdAt
      updatedAt
      updatedAtBlock
      updatedAtBlockHash
      data
      inputData
    }
  }
`;