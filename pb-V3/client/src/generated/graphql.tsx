import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Account = {
  __typename?: 'Account';
  uuid: Scalars['ID'];
  portfolios?: Maybe<Array<Maybe<Portfolio>>>;
};

export type CreatePortfolioForAccountInput = {
  accountUuid: Scalars['ID'];
  positions?: Maybe<Array<Maybe<CreatePositionInput>>>;
  portfolioType: PortfolioType;
};

export type CreatePositionInput = {
  amount: Scalars['Float'];
  averagePrice: Scalars['Float'];
  positionType: PositionType;
  positionsGroupUuid?: Maybe<Scalars['ID']>;
  instrument: Scalars['String'];
  direction: PositionDirection;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPosition: Position;
  createAccount: Account;
  createUser: User;
  deleteGroup?: Maybe<Portfolio>;
  mergeGroups?: Maybe<Portfolio>;
  copyAndMergeGroup?: Maybe<Portfolio>;
  createEmptyGroup?: Maybe<Portfolio>;
  syncPositionsForUser?: Maybe<Scalars['Boolean']>;
};


export type MutationCreatePositionArgs = {
  input: CreatePositionInput;
};


export type MutationCreateAccountArgs = {
  input: Scalars['ID'];
};


export type MutationDeleteGroupArgs = {
  input: Scalars['ID'];
};


export type MutationMergeGroupsArgs = {
  targetGroupUuid: Scalars['ID'];
  originGroupUuid: Scalars['ID'];
};


export type MutationCopyAndMergeGroupArgs = {
  targetGroupUuid: Scalars['ID'];
  originGroupUuid: Scalars['ID'];
};


export type MutationCreateEmptyGroupArgs = {
  accountUuid: Scalars['ID'];
};


export type MutationSyncPositionsForUserArgs = {
  input: SyncUserAccountsPositionsInput;
};

export type Portfolio = {
  __typename?: 'Portfolio';
  uuid: Scalars['ID'];
  name: Scalars['String'];
  equity?: Maybe<Scalars['Float']>;
  portfolioType?: Maybe<PortfolioType>;
  positions?: Maybe<Array<Maybe<Position>>>;
};

export type PortfolioInput = {
  name: Scalars['String'];
  equity?: Maybe<Scalars['Float']>;
  portfolioType?: Maybe<PortfolioType>;
};

export enum PortfolioType {
  Real = 'REAL',
  Simulated = 'SIMULATED',
  Imported = 'IMPORTED',
  Unauthenticated = 'UNAUTHENTICATED'
}

export type Position = {
  __typename?: 'Position';
  uuid: Scalars['ID'];
  amount: Scalars['Float'];
  averagePrice: Scalars['Float'];
  positionType: PositionType;
  instrument: Scalars['String'];
};

export enum PositionDirection {
  Buy = 'BUY',
  Sell = 'SELL'
}

export enum PositionType {
  Option = 'OPTION',
  Future = 'FUTURE'
}

export type Query = {
  __typename?: 'Query';
  portfolios?: Maybe<Array<Maybe<Portfolio>>>;
  positions?: Maybe<Array<Maybe<Position>>>;
  userByUuid?: Maybe<User>;
  accountByUuid?: Maybe<Array<Maybe<Portfolio>>>;
  accountByPlatformId?: Maybe<Account>;
};


export type QueryUserByUuidArgs = {
  input: Scalars['ID'];
};


export type QueryAccountByUuidArgs = {
  input: Scalars['ID'];
};


export type QueryAccountByPlatformIdArgs = {
  input: Scalars['Int'];
};

export type SyncUserAccountsPositionsInput = {
  mainAccountPlatformId?: Maybe<Scalars['Int']>;
  accountsWithPositions: Array<Maybe<UpdatePositionsForAccountInput>>;
};

export type UpdatePositionsForAccountInput = {
  accountPlatformId?: Maybe<Scalars['Int']>;
  accountUuid?: Maybe<Scalars['ID']>;
  positions?: Maybe<Array<Maybe<CreatePositionInput>>>;
  portfolioType?: Maybe<PortfolioType>;
};

export type User = {
  __typename?: 'User';
  uuid: Scalars['ID'];
  accounts?: Maybe<Array<Maybe<Account>>>;
};

export type GetUserDataQueryVariables = Exact<{
  userByUuidInput: Scalars['ID'];
}>;


export type GetUserDataQuery = { __typename?: 'Query', userByUuid?: Maybe<{ __typename?: 'User', uuid: string }> };


export const GetUserDataDocument = gql`
    query getUserData($userByUuidInput: ID!) {
  userByUuid(input: $userByUuidInput) {
    uuid
  }
}
    `;

/**
 * __useGetUserDataQuery__
 *
 * To run a query within a React component, call `useGetUserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDataQuery({
 *   variables: {
 *      userByUuidInput: // value for 'userByUuidInput'
 *   },
 * });
 */
export function useGetUserDataQuery(baseOptions: Apollo.QueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
      }
export function useGetUserDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
        }
export type GetUserDataQueryHookResult = ReturnType<typeof useGetUserDataQuery>;
export type GetUserDataLazyQueryHookResult = ReturnType<typeof useGetUserDataLazyQuery>;
export type GetUserDataQueryResult = Apollo.QueryResult<GetUserDataQuery, GetUserDataQueryVariables>;