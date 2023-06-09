import { gql } from "apollo-server-express";

export const typeDefs = gql`

    type Query {
        portfolios: [Portfolio]
        positions: [Position]
        userByUuid(input: ID!): User
        accountByUuid(input: ID!): [Portfolio]
        # This can be many accounts if we log in as many account aka user.
        accountByPlatformId(input: Int!): Account
        # rename to accounts and merge with the others ones maybe
        portfoliosByUser(input: Int!): [Account]
    }

    type Mutation {
        createPosition(input: CreatePositionInput!): Portfolio!
        createAccount(input: ID!): Account!
        createUser: User!
        deleteGroup(input: ID!): Portfolio
        mergeGroups(targetGroupUuid: ID!, originGroupUuid: ID!): Portfolio
        copyAndMergeGroup(targetGroupUuid: ID!, originGroupUuid: ID!): Portfolio
        createEmptyGroup(accountUuid: ID!): Portfolio
        # createGroupWithPositions(input: CreateGroupForAccountInput!): Portfolio
        # TODO: What should be return type
        syncPositionsForUser(input: SyncUserAccountsPositionsInput!): [Account]
    }

    input SyncUserAccountsPositionsInput {
        mainAccountPlatformId: Int
        offlinePositions: [CreatePositionInput]
        accountsWithPositions: [UpdatePositionsForAccountInput]!
    }

    input CreatePositionInput {
        amount: Float!
        averagePrice: Float!
        positionType: PositionType!
        positionsGroupUuid: ID
        instrument: String!
        direction: PositionDirection!
    }

    input UpdatePositionsForAccountInput {
        accountPlatformId: Int
        accountUuid: ID
        positions: [CreatePositionInput]
        portfolioType: PortfolioType
    }


    # input UpdatePositionInput {
    #     id: ID
    #     realAmount: Float
    #     averagePrice: Float
    #     updatedAmount: Float
    #     positionType: PositionType
    #     portfolioUuid: ID
    #     instrument: String
    #     direction: PositionDirection
    # }

    input CreatePortfolioForAccountInput {
        accountUuid: ID!
        positions: [CreatePositionInput]
        portfolioType: PortfolioType!
    }

    type Position {
        uuid: ID!
        amount: Float!
        averagePrice: Float!
        positionType: PositionType!
        direction: PositionDirection
        instrument: String!
    }

    type Portfolio {
        # TODO add account relation for speed
        uuid: ID!
        name: String!
        equity: Float
        portfolioType: PortfolioType 
        positions: [Position]
    }

    type User {
        uuid: ID!
        accounts: [Account]
    }

    type Account {
        uuid: ID!
        # name: String! to be added
        portfolios: [Portfolio]
        accountPlatformId: Int
    }

    input PortfolioInput {
        name: String!
        equity: Float
        portfolioType: PortfolioType
    }

    enum PortfolioType {
        REAL
        SIMULATED
        IMPORTED
        UNAUTHENTICATED
    }

    enum PositionType {
        OPTION
        FUTURE
    }

    enum PositionDirection {
        BUY
        SELL
    }
`;
