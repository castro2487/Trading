1. Handle tokens
3. Futures and options amount sometimes is usd sometime it is btc.
4. Remove all warnings
6. I only use BTC, needs to be added ETH and also needs to be reworked a little bit maybe to accomodate additional currencies.
8. direction/positionDirection, averagePrice/averagePrice sync across models, chartLines/graphData
9. Equity for subaccounts investigate.
10. Errors management
11. Account can have array of different positions with custom names etc
12. We can remove addPositionPnlToChart and always use multiple
13. It is important to sync creation of positions. Sometimes it is crypto sometimes it is usd
and the position created with 1 usd will show no difference in chart
14. userPlatformId better to be accoutId. Also sessionStorage vs state etc. accountUuid/accountPlatformId
15. Errors on here and there by not having id and not synched etc
16. Translations
17. Date utils for positions extract in same place
18. Calculate only one line if there is time added.
19. Single positions slider start date and end date the same bug
20. Possible bug. If we have a ticker data already we dont add a position because it will be considered added.
21. When sliding the chart also changes. I do not believe it is the intended behavior.
22. Order params in calculations, domain first etc
23. Localstorage abstract so we dont deal with undefined and parse and it could be changed to something else, indexDB etc.