const InvoiceAPI = {
    LIST: (axiosPrivate, clientID, pageNumber, pageSize) => {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.microsoft_code}`,
        },
      };
      return axiosPrivate.get(
        `/invoices/client/${clientID}/?page=${pageNumber}&page_size=${pageSize}`,
        config
      );
    },
    REGENERATE:(axiosPrivate,id,payload)=>{
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.microsoft_code}`,
        },
      };
      return axiosPrivate.post(`/regenerate-invoice/${id}/`,payload,config);  
    },
    PAID:(axiosPrivate,payload)=>{
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.microsoft_code}`,
        },
      };
      return axiosPrivate.patch(`/update_invoices/`,payload,config);  

    },
    SENDMAIL:(axiosPrivate,payload)=>{
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.microsoft_code}`,
        },
      };
      return axiosPrivate.post(`/send_invoices/`,payload,config);
    }
}
export default InvoiceAPI;