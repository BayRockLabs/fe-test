const UploadFileAPI = {
  UPLOAD: "/contract/file/upload/",
  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/contract/file-delete/${id}/`, {}, config);
  },

  DOWNLOAD: (id) => {
    return `/contract/file-download/${id}`;
  },

  EXTRACT_FILE_DATA: (docType) => {
    return `/extract-information/?document_type=${docType}`;
  },
};

export default UploadFileAPI;
