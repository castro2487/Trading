# You need to create two .env files in both the client and server.

# Client enviroment variables

## REACT_APP_PLATFORM_WS_URL
Controls the url of the web socket connection. This is the BE platform.

Example: 
REACT_APP_PLATFORM_WS_URL=wss://test.deribit.com/ws/api/v2



## REACT_APP_GRAPHQL_URL

Controls the url for the position builder back end.

Example: REACT_APP_GRAPHQL_URL=http://localhost:4001/graphql


## REACT_APP_SCI_CHART_LICENCE_KEY

Licence key for the chart library that we use. See https://www.scichart.com/

Example: REACT_APP_SCI_CHART_LICENCE_KEY=altaKgublgqxhluB8QOeUjy407/BVY6esESvqmB+nnS8ACaz2lREZqLXun2H4G5NDXFVHlmRx1IHnS85B0HOIeVDDVOZ72nqubuosb4KQ8Pt4QT/AoycXhk2X8DLno/h+IPh+L3lG1dkF223gIqBzOSeOyNiL1PRohHpocga384zuMfkt4zPsVsWiYTkMtHzCSsobmdXLIhkzrKE6IMK8l7Ztolk7VgFpMES4Uc1k7sjuRbCYaVtH0QYBam0P6+DL39BmTrTHh+zEgE4zPGvLDTd7FAiyXe7CLWPo021/JJ+VEBNWE27qEoXNrpNxIhT0538n4CIwm03lda72IRITV+5ToxozM6U6Ma2arzZSP3Hs+7Z1M34vGnCp0jV1PKUzfkqpB1PPru6ai2ow9IASJYZtSoDlKov4TzIffAYbXR6639g2o1ddGfD6hiyEJH1LNj1aOrSA91cw5B7CU3wI5Gduqp3VwjfSP75I+eLeSpkd3CvwzqlFnLXzOzAJyrVXCXvEshGWvPmtlbv76dbf/tdJ3t7AnTS39kZl1xfhWNabUVz48lnLI+pJ2yxmXtCUMeUEdVGVAxy/wRt+ZegpnkyrFpepnVvQ/c2GQJGkMR8BDjYDS9ogK4XEkfqr0LslUDTpT2Jn7MPhPNVWJCg0N0El/l3Kb7d1Tu/JFfHn3IT3ELseajVoMN7JkDNU8W4HX4syRTo5qvYwBkZFyGfgnJJcQMwtoGn52nw


## REACT_APP_X_AXIS_MIN
Controls the smallest number in the x axis in the chart that will be calculated. 

Example: REACT_APP_X_AXIS_MIN=10000
Default: 0

## REACT_APP_X_AXIS_MAX
Controls the largest number in the x axis in the chart that will be calculated. 

Example: REACT_APP_X_AXIS_MAX=100000
Default: 400000

## REACT_APP_X_AXIS_STEP
Controls the step between one pricing point and the other. This variable indirectly controls how many points do we calculate.

Example: REACT_APP_X_AXIS_STEP=1
Default: 1


## REACT_APP_SLIDER_RECALCULATION_TIMEOUT_MS
Controls how often do we recalculate the pnl in miliseconds while sliding the expiry slider.

Example: REACT_APP_SLIDER_RECALCULATION_TIMEOUT_MS=200
Default: 200

## REACT_APP_LINE_ROOT_EPISON
Controls the error margin in calculating the exact root of a line. 

Example: REACT_APP_LINE_ROOT_EPISON=0.0000001
Default: 0.0000000001


## REACT_APP_IMPLIED_VOL_MIN_TEXP
Used when calculating moneyness for implied volatility with stiky delta. 

Example: REACT_APP_IMPLIED_VOL_MIN_TEXP=0.000114155
Default: 1/24/365=0.000114155

## REACT_APP_IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS
Used for extrapolating when calculating stiky delta volatility.

Example: REACT_APP_IMPLIED_VOL_MAX_EXTRAPOLATION_PER_MONEYNESS=0.1
Default 10% = 0.1

# Server enviroment variables

## DATABASE_URL
Controls the database connection string

Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/pb"


## PORT
Controls the port for the position builder server.

Example: PORT=4001
Default: 4001