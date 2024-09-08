import { useState } from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import { useUser } from "../UserContext";
import React from "react";

const RatingCellRenderer = ({
  value,
  rowIndex,
  onCellValueChanged,
  params,
}: any) => {
  const [rating, setRating] = useState(value);
  const { userRole } = useUser();

  const handleRatingChange = (event: any, newValue: any) => {
    setRating(newValue);
    params.data.rating = newValue;
    onCellValueChanged(params);
  };

  return (
    <Box component="fieldset" borderColor="transparent">
      <Rating
        value={rating}
        onChange={userRole === "ADMIN" ? handleRatingChange : undefined}
        readOnly={userRole !== "ADMIN"}
      />
    </Box>
  );
};

export default RatingCellRenderer;