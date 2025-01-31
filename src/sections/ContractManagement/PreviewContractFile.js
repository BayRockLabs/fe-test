import * as React from "react";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import Item from "../../common/Item";
import PdfDocDefault from "../../assets/svg/PdfDocDefault";
import CircularProgressWithLabel from "../../components/CircularProgressWithLabel";
import MenuVertical from "../../assets/svg/menu/MenuVertical";
import { createStyles, useTheme } from "@mui/styles";
import { useSnackbar } from "notistack";
import { displayError } from "../../utils/handleErrors";
import UploadFileAPI from "../../services/UploadFileService";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import useLocales from "../../hooks/useLocales";
import DeleteIcon from "@mui/icons-material/Delete";
import { anchorOrigin } from "../../utils/constants";

const useStyles = createStyles((theme) => ({
  rootBox: {
    flexDirection: "row",
    borderRadius: "12px",
    padding: 1.3,
    border: `1px solid var(--shades-color-4, ${theme.palette.text.border})`,
    background: `var(--shades-color-5, ${theme.palette.background.paper})`,
    gap: 0.7,
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { padding: 0.7 },
}));

function PreviewContractFile({
  isEditMode = false,
  filesData = [],
  deletedFilesData = [],
  onFilesDeleted,
  setselectedfiles,
}) {
  const onDeleteFile = (fileData) => {
    onFilesDeleted(
      [...deletedFilesData, fileData],
      filesData.filter((item) => item.uuid !== fileData.uuid)
    );
  };
  const FileItem = ({
    isEditMode = false,
    fileData = { uuid: "", name: "" },
    onDeleteFile,
  }) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { translate } = useLocales();
    const { enqueueSnackbar } = useSnackbar();
    const axiosPrivate = useAxiosPrivate();
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadClick = () => {
      if (downloading) return;
      setProgress(0);
      setDownloading(true);
      downloadFile();
    };

    const handleDelete = () => {
      onDeleteFile(fileData);
    };
    const onError = (message) => {
      setDownloading(false);
      enqueueSnackbar("File - " + message, {
        anchorOrigin,
        variant: "error",
      });
    };
    console.log("iseditmode", isEditMode);

    async function onFileDownLoaded(response) {
      setDownloading(false);

      try {
        const blob = new Blob([response.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileData.blob_name}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.log("Error in onFileDownLoaded() - ", error);
        onError(translate("error.download") + error);
      }
    }

    async function downloadFileProgress(id) {
      return axiosPrivate.get(UploadFileAPI.DOWNLOAD(id), {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.microsoft_code}`,
        },
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
    }

    async function downloadFile() {
      try {
        const response = await downloadFileProgress(fileData.uuid);
        if (isValidResponse(response)) {
          onFileDownLoaded(response);
        }
      } catch (error) {
        console.log("Error in downloadFile() - ", error);
        onError(translate("error.download") + error);
      }
    }

    return (
      <Item onClick={handleDownloadClick} sx={styles.rootBox}>
        <PdfDocDefault cursor="pointer" />

        <Typography
          variant="subtitle"
          sx={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "initial",
          }}
        >{`${
          fileData.blob_name || fileData.name || "Unnamed File"
        }`}</Typography>

        {isEditMode ? (
          <DeleteIcon
            fontSize="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          />
        ) : (
          <MenuVertical sx={styles.menuIcon} />
        )}

        {downloading && (
          <CircularProgressWithLabel
            variant={progress > 0 ? "determinate" : "indeterminate"}
            value={progress}
            size={30}
          />
        )}
      </Item>
    );
  };

  return (
    <Stack direction="row" spacing={4} padding={2}>
      {filesData?.map((item, index) => {
        return (
          <FileItem
            key={item.uuid + "_" + index}
            isEditMode={isEditMode}
            fileData={item}
            onDeleteFile={onDeleteFile}
          />
        );
      })}
    </Stack>
  );
}

export default PreviewContractFile;
