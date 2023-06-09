import  MaterialTable  from "@material-table/core"
import columnsDef from "./Columns";
import { useAppSelector } from 'common/hooks';
import { selectAllPositions, selectAllAvailablePositions } from 'store/positionsSlice';
import { dataTransform } from "common/utils/tableDataTransform";
import { dataTransformV2 } from "common/utils/tableDataTransformv2";

const PortfoliosTable = () => {
  const tPositions = useAppSelector(selectAllPositions);
  const aPositions = useAppSelector(selectAllAvailablePositions);
  const mutatedPositions = dataTransform(tPositions)
  const adaptedPositions = dataTransformV2(aPositions)
  return (
    <>
      <MaterialTable
      title="Positions"
      data={mutatedPositions}
      columns={columnsDef}
      parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
      options={{
        selection: true,
        search: false,
        paging: false 
      }}
    />
    </>
  );
};

export default PortfoliosTable;
