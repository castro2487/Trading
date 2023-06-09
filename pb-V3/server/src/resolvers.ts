import { PortfolioType, PositionType, prisma, PrismaClient } from "@prisma/client";
import { __InputValue } from "graphql";
import { Context } from ".";

export const resolvers = {
    Query: {
        // positionGroups: async (_, args, context: Context) => {
        //     return context.prisma.positionsGroup.findMany()
        // },
        positions: async (_, args, context: Context) => {
            return context.prisma.position.findMany()
        },
        userByUuid: async (_, args, context: Context) => {
            return context.prisma.user.findFirst(
                {
                    where: {
                        uuid: args.input
                    }
                })
        },
        accountByUuid: async (_, args, context: Context) => {
            return context.prisma.account.findFirst({
                where: {
                    uuid: args.input
                }
            })
        },
        accountByPlatformId: async (_, { input }, context: Context) => {
            return context.prisma.account.findFirst({
                where: {
                    accountPlatformId: input
                }
            })
        },
        portfoliosByUser: async (_, { input }, context: Context) => {
            return context.prisma.$transaction(async prisma => {
                const currentAccount = await prisma.account.findFirst({
                    where: {
                        accountPlatformId: input
                    },
                    include: {
                        postfolios: {
                            include: {
                                positions: {
                                }
                            }
                        }
                    }
                })

                // User for the account. 
                const user = await prisma.user.findFirst({
                    where: {
                        uuid: currentAccount.userUuid
                    },
                    include: {
                        accounts: {
                            include: {
                                postfolios: {
                                    include: {
                                        positions: {
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                // Main account. Return all subs with all positions
                if (user.platformAccountId === input) {
                    return user.accounts
                }
                // return only one account.
                return [currentAccount]
            })
        },
    },
    User: {
        accounts: async (parent, args, context: Context) => {
            return context.prisma.account.findMany({
                where: {
                    userUuid: parent.uuid
                }
            })
        }
    },
    Account: {
        portfolios: async (parent, args, context: Context) => {
            return context.prisma.portfolio.findMany({
                where: {
                    accountUuid: parent.uuid
                }
            })
        }
    },
    Portfolio: {
        positions: async (parent, args, context: Context) => {
            return context.prisma.position.findMany({
                where: {
                    portfolioUuid: parent.uuid
                }
            })
        }
    },
    Mutation: {
        // TODO: Bad and unperformant code, I did this asap so I could to work with the calculations
        // adds simulated position for the active account
        createPosition: async (root, { input }, context: Context, info) => {

            return context.prisma.$transaction(async prisma => {
                const activeAccount = await prisma.account.findFirst({
                    where: {
                        accountPlatformId: context.activeAccountPlatformId
                    }
                })
                const simulatedGroupsPortfolio = await prisma.portfolio.findFirst({
                    where: {
                        portfolioType: PortfolioType.SIMULATED,
                        accountUuid: activeAccount.uuid
                    }
                })
                return await prisma.portfolio.update({
                    where: {
                        uuid: simulatedGroupsPortfolio.uuid
                    },
                    data: {
                        positions: {
                            create: {
                                ...input
                            }
                        }
                    }
                })
            })
        },
        deleteGroup: async (root, args, context: Context, info) => {
            // return context.prisma.positionsGroup.delete({
            //     where: {
            //         uuid: args.input
            //     }
            // })
        },
        mergeGroups: async (root, args, context: Context, info) => {
            // return await context.prisma.$transaction([
            //     context.prisma.position.updateMany({
            //         where: {
            //             positionsGroupUuid: args.originGroupUuid
            //         },
            //         data: {
            //             positionsGroupUuid: args.targetGroupUuid
            //         }
            //     }),
            //     context.prisma.positionsGroup.delete({
            //         where: {
            //             uuid: args.originGroupUuid
            //         }
            //     })
            // ])
        },
        copyAndMergeGroup: async (root, args, context: Context, info) => {

            // const positions = await context.prisma.position.findMany({
            //     where: {
            //         positionsGroupUuid: args.originGroupUuid
            //     }
            // })

            // return await context.prisma.positionsGroup.update(
            //     {
            //         where: {
            //             uuid: args.targetGroupUuid
            //         },
            //         data: {
            //             positions: {
            //                 createMany: {
            //                     data: [
            //                         ...positions.map(p => {
            //                             return {
            //                                 averagePrice: p.averagePrice,
            //                                 instrument: p.instrument,
            //                                 positionType: p.positionType,
            //                                 realAmount: p.realAmount,
            //                                 direction: args.input.direction
            //                             }
            //                         })
            //                     ]
            //                 }
            //             }
            //         }
            //     }
            // )

            // TODO:  fix syntax
            // try {
            //     await context.prisma.$transaction(async (prisma) => {
            //         // Code running in a transaction...
            //     })
            // } catch (err) {
            //     // Handle the rollback...
            // }
        },
        createEmptyGroup: async (root, args, context: Context, info) => {
            // 
        },
        // createGroupWithPositions: async (root, args, context: Context, info) => {
        //     // 
        // },
    }
};
