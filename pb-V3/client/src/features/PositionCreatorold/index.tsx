import React, { useState } from "react";

import { makeStyles } from "@material-ui/core";

import {
  PositionDirection,
  PositionType,
  // useCopyAndMergeGroupMutationMutation,
  // useCreatePositionMutationMutation,
  // useDeleteGroupMutationMutation,
} from "../../generated/graphql";
import { createSimulatedPosition } from "store/positionsSlice";
import { useAppDispatch } from "common/hooks";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    border: "1px solid blue",
    marginTop: "20px",
    marginBottom: "20px",
  },
}));

function Counter() {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = useState("BTC-24JUN22-50000-C");
  const [positionGroupUuid, setPositionGroupUuid] = useState("");
  const [positionType, setPositionType] = useState("OPTION");
  const [amount, setAmount] = useState(1);

  // const [createPositionMutationMutation, { data, loading, error }] =
  //   useCreatePositionMutationMutation();

  // const [deleteMutation] = useDeleteGroupMutationMutation();
  // const [duplicate] = useCopyAndMergeGroupMutationMutation();

  const a = (direction) => {
    // @ts-ignore
    dispatch(createSimulatedPosition({
      positionType: positionType === 'FUTURE' ? PositionType.Future : PositionType.Option,
      instrument: inputValue,
      direction: direction,
      amount: amount
    }))

    // createPositionMutationMutation({
    //   variables: {
    //     createPositionInput: {
    //       averagePrice: 0,
    //       positionType: positionType === 'FUTURE' ? PositionType.Future : PositionType.Option,
    //       positionsGroupUuid: positionGroupUuid,
    //       realAmount: amount,
    //       instrument: inputValue,
    //       direction: direction
    //     },
    //   },
    // })
    //   .then((res) => {
    //     console.log("success");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  const groupOperation = (groupUuid, action) => {
    if (action === "DELETE") {
      // deleteMutation({
      //   variables: {
      //     deleteGroupInput: groupUuid,
      //   },
      // });
    } else if (action === "MERGE") {
      //  this is with delete
    } else {
      // duplicate({
      //   variables: {
      //     copyAndMergeGroupOriginGroupUuid: groupUuid,
      //     copyAndMergeGroupTargetGroupUuid: positionGroupUuid,
      //   },
      // });
    }
  };

  const b = (type: string) => {
    if (type === 'o') {
      setPositionType('OPTION')
      setInputValue('BTC-24JUN22-50000-C')
    } else {
      setPositionType('FUTURE')
      setInputValue('BTC-25MAR22')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div>Position Creator</div>
      <input
        placeholder="instrument"
        onChange={(e) => setInputValue(e.target.value)}
      />
      <input
        placeholder="amount"
        type="number"
        onChange={(e) => setAmount(parseFloat(e.target.value))}
      />
      <select onChange={(e) => setPositionType(e.target.value)}>
        <option value="OPTION">OPTION</option>
        <option value="FUTURE">FUTURE</option>
      </select>
      <input
        placeholder="position group"
        onChange={(e) => setPositionGroupUuid(e.target.value)}
      />
      <button onClick={e => a(PositionDirection.Buy)}>Long</button>
      <button onClick={e => a(PositionDirection.Sell)}>Short</button>
      <button onClick={e => b('f')}>Future</button>
      <button onClick={e => b('o')}>Option</button>
      <div>BTC-26NOV21-45000-C</div>
      <div>BTC-24JUN22-50000-C</div>
      <div>BTC-31DEC21</div>
      <div>BTC-25MAR22</div>
      <br />
      <br />
      <br />
      {/* <PositionsTree groupOperation={groupOperation} /> */}
    </div>
  );
}

export default Counter;
