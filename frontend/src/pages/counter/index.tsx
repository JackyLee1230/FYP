import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { decrement, increment } from "../../slices/counterSlice";
import { useTypedSelector } from "../../../store";

export default function Counter() {
  const count = useTypedSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
      </div>
    </div>
  );
}

