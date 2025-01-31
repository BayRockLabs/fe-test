import { Box } from "@mui/material";
import TimeSheetListScreen from "./TimeSheetListScreen";
import { useState } from "react";
import AddFormModal from "../../components/AddFormModal";
import TimesheetApprovals from "./TimesheetApprovals";

export default function TimesheetManagerView() {
  const [isApproveOpen, setApproveOpen] = useState(false);

  const showApproveModal = () => {
    setApproveOpen(true);
  };

  const closeApproveModal = () => {
    setApproveOpen(false);
  };

  return (
    <Box>
      {isApproveOpen && (
        <AddFormModal onClose={closeApproveModal}>
          <TimesheetApprovals handleClose={closeApproveModal} />
        </AddFormModal>
      )}

      <TimeSheetListScreen showApproveModal={showApproveModal} />
    </Box>
  );
}
