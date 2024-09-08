import Select from "react-select";
import { useState } from "react";
import React from "react";

const ProgressCellRenderer = ({ options, onCellValueChanged, params }: any) => {
  const { value } = params;
  const [progress, setProgress] = useState(value);

  // console.log(options)

  const handleProgressChange = (newValue: any) => {
    params.data.course_progress = newValue;
    setProgress(newValue);
    onCellValueChanged(params);
    params.api.stopEditing();
  };

  return (
    <Select
      value={progress}
      onChange={handleProgressChange}
      options={options}
      getOptionLabel={(option: any) => option.progress_status}
      getOptionValue={(option: any) => option.id}
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
    />
  );
};

export default ProgressCellRenderer;