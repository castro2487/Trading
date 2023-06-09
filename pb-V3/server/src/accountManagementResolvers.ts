import { PortfolioType } from ".prisma/client";
import { Context } from ".";


/**
 * Resolvers
 */
export const accountResolvers = {
  Mutation: {
    // TODO no need probably. Accounts are created by updating real positions and logging in from 
    // the platform
    // createAccount: async (root, args, context: Context, info) => {
    //   return context.prisma.account.create({
    //     data: {
    //       userUuid: args.input,
    //       positionGroups: {
    //         create: [
    //           {
    //             equity: 0,
    //             name: "Sim pos 1",
    //             positionGroupType: PositionGroupType.SIMULATED,
    //           }
    //         ]
    //       }
    //     }
    //   })
    // },
    createUser: async (root, args, context: Context, info) => {
      return context.prisma.user.create({
        data: {}
      })
    },
    /**
     * 
     * // TODO important. to be broken apart!!!
     * 
     * Sync the accounts from the platform with the ones that we have in PB. If account does not
     * exist it will be created, if the account exist all the positions in the real positions group
     * will be deleted and new ones will be added.
     *  
     * @param root 
     * @param param1 
     * @param context 
     * @param info 
     * @returns TODO: to be decided or error if something fails 
     */
    syncPositionsForUser: async (root, { input: { mainAccountPlatformId,
      accountsWithPositions,
      offlinePositions } }, context: Context, info) => {

      /**
       * We create the user if not exist. This is the owner of all accounts.
       * The user is uniquely identified by the mainAccountPlatformId. The
       * platform does not have users they somehow connect account with other accounts
       * and they solve the problem of not having a user like that.
       */
      const user = await context.prisma.user.upsert({
        where: {
          platformAccountId: mainAccountPlatformId
        },
        update: {
        },
        create: {
          platformAccountId: mainAccountPlatformId
        }
      })

      try {

        // TODO: can be optimized by a lot, to many awaits that are not necesary if upsert is used
        // Did not have the time to check it out exacly how to do proper upsert on account with
        // positions and portfolios
        let res = await context.prisma.$transaction(async prisma => {
          for (const account of accountsWithPositions) {

            const newAccount = await prisma.account.upsert({
              where: {
                accountPlatformId: account.accountPlatformId
              },
              create: {
                accountPlatformId: account.accountPlatformId,
                userUuid: user.uuid,
                postfolios: {
                  createMany: {
                    data: [{
                      portfolioType: PortfolioType.REAL,
                      equity: 0,
                      name: 'Real positions',
                    },
                    {
                      portfolioType: PortfolioType.SIMULATED,
                      equity: 0,
                      name: 'Simulated positions',
                    }]
                  }
                }
              },
              update: {
              },
            })

            const realPositionsPortfolio = await prisma.portfolio.findFirst({
              where: {
                accountUuid: newAccount.uuid,
                portfolioType: PortfolioType.REAL
              }
            })

            await prisma.position.deleteMany({
              where: {
                portfolioUuid: realPositionsPortfolio.uuid
              },
            })

            await prisma.portfolio.update({
              where: {
                uuid: realPositionsPortfolio.uuid
              },
              data: {
                positions: {
                  createMany: {
                    data: [
                      ...account.positions.map(p => {
                        return {
                          averagePrice: p.averagePrice,
                          instrument: p.instrument,
                          positionType: p.positionType,
                          amount: p.amount,
                          direction: p.direction
                        }
                      })
                    ]
                  }
                }
              }
            })
          }

          const currentAccount = await prisma.account.findFirst({
            where: {
              accountPlatformId: context.activeAccountPlatformId
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

          const user2 = await prisma.user.findFirst({
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

          if (offlinePositions.length > 0) {
            await prisma.portfolio.create({
              data: {
                portfolioType: PortfolioType.UNAUTHENTICATED,
                equity: 0,
                name: 'Unathenticated positions',
                accountUuid: currentAccount.uuid,
                positions: {
                  createMany: {
                    data: [
                      ...offlinePositions.map(p => {
                        return {
                          averagePrice: p.averagePrice,
                          instrument: p.instrument,
                          positionType: p.positionType,
                          amount: p.amount,
                          direction: p.direction
                        }
                      })
                    ]
                  }
                }
              }
            })
          }

          // Main account. Return all subs with all positions
          if (user2.platformAccountId === currentAccount.accountPlatformId) {
            return user2.accounts
          }
          // return only one account.
          return [currentAccount]
        })

        return res
      } catch (error) {
        // TODO return the error
        console.log(error.message)
        return false
      }
    },
  },
}


