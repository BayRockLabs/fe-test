import * as React from "react";

import { useState } from "react";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import { UploadMultiFile } from "../../components/upload";
import useLocales from "../../hooks/useLocales";
import { useCallback } from "react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import UploadFileAPI from "../../services/UploadFileService";
import { anchorOrigin } from "../../utils/constants";
UploadContractFile.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  uploadUrl: PropTypes.string,
  onFileUploaded: PropTypes.func,
  onFileUploading: PropTypes.func,
  setClientContractFile: PropTypes.func,
};
export default function UploadContractFile({
  uploadUrl,
  onFileUploaded,
  onFileUploading,
  onFileDeleted = () => {},
  deleteCount = 0,
  showLoading,
  setClientContractFile,
  selectedFiles,
  setSelectedFiles,
}) {
  const { translate } = useLocales();

  const [upLoadedFileData, setUpLoadedFileData] = useState([]);
  const [progressList, setProgressList] = useState({});

  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // 👇️ don't run on the initial render
    if (deleteCount !== 0) {
      onRemoveFile();
    }
  }, [deleteCount]);

  useEffect(() => {
    onFileUploaded(upLoadedFileData);
  }, [upLoadedFileData]);

  useEffect(() => {
    onUploadFiles();
  }, [selectedFiles]);

  function getUploadURL() {
    return uploadUrl ?? UploadFileAPI.EXTRACT_FILE_DATA;
  }

  async function uploadFileToServer(formData, index) {
    return axiosPrivate.post(getUploadURL(), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        if (percentage < 100) {
          updatedProgress(percentage, index);
        }
      },
    });
  }

  function updatedProgress(percentage, index) {
    progressList[index] = percentage;
    let updatedProgressList = progressList;
    updatedProgressList = {
      ...updatedProgressList,
      [index]: percentage,
    };
    setProgressList(updatedProgressList);
  }

  const onError = (message) => {
    enqueueSnackbar("File - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  const onUploadFiles = async () => {
    if (selectedFiles?.length > 0) {
      selectedFiles?.map(async (file, index) => {
        try {
          if (onFileUploading) {
            onFileUploading(file);
            setClientContractFile(file);
          }
          const formData = new FormData();
          formData.append("file", file);
          const response = await uploadFileToServer(formData, index);

          if (isValidResponse(response)) {
            const uploadedFiles = response?.data?.uploaded_files;
            if (uploadedFiles) {
              for (const file of uploadedFiles) {
                const fileUUID = file?.uuid;
                const fileName = file?.blob_name;
                if (fileUUID) {
                  setUpLoadedFileData([
                    ...upLoadedFileData,
                    { uuid: fileUUID, name: fileName },
                  ]);
                  updatedProgress(100, index);
                } else {
                  onError(translate("error.upload"));
                }
              }
            }
          } else {
            onError(translate("error.upload"));
          }
        } catch (error) {
          // console.log("Error in onUploadFiles() - ", error);
          // onError(translate("error.upload") + error);
        }
      });
    }
  };

  async function onFileDeletedSuccess() {
    setSelectedFiles([]);
    setUpLoadedFileData([]);
    onFileDeleted();
  }

  const onRemoveFile = async (file, position) => {
    deleteFilesFromServer(axiosPrivate, upLoadedFileData, (fileData) => {
      onError(translate("error.deleteFail"));
    });
    onFileDeletedSuccess();
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      console.log("Accepted Files:", acceptedFiles);

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log("Selected File:", file);

        setSelectedFiles([
          ...selectedFiles,
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ]);
        setClientContractFile(file);
        console.log("Client Contract File Set:", file);
      }
    },
    [selectedFiles, setClientContractFile]
  );

  return (
    <UploadMultiFile
      files={selectedFiles}
      onUpload={onUploadFiles}
      onRemove={onRemoveFile}
      progressList={progressList}
      onDrop={handleDrop}
      multiple={false}
      showLoading={showLoading}
      accept={{
        "application/pdf": [],
        "application/msword": [],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [],
      }}
    />
  );
}

export async function deleteFileFromServer(axiosPrivate, deletedFile, onError) {
  try {
    await UploadFileAPI.DELETE(axiosPrivate, deletedFile.uuid);
  } catch (error) {
    console.log("Error in deleteFileFromServer() - ", error);
    onError(deletedFile);
  }
}
export async function deleteFilesFromServer(
  axiosPrivate,
  deletedFiles,
  onError
) {
  if (deletedFiles?.length > 0) {
    deletedFiles?.forEach(async (item) => {
      deleteFileFromServer(axiosPrivate, item, onError);
    });
  }
}
