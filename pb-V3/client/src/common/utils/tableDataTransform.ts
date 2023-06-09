export const dataTransform = (tPositions) => {
  
    const cPositions = tPositions.map(tposition => (

      tposition.positionType === "OPTION"?
      {...tposition, parentId: 2, id: 4} :
      {...tposition, parentId: 3, id: 4}

    ))
    
    const nPositions = [
      {
        id: 1,
        instrument: "Unauthenticated Positions",
      },
      {

        id: 2,
        instrument: "Options",
        parentId: 1
      },
      {
        id: 3,
        instrument: "Futures",
        parentId: 1 
      },
      ...cPositions
    ]
    return nPositions.length <= 3 ? [] : nPositions
}                    