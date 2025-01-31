const DASHBOARDAPI = {
    DATA: (axiosPrivate) => {
        const config = {
        headers: {
            'Authorization': `Bearer ${localStorage.microsoft_code}`
        }
        };
        return axiosPrivate.get(`/dashboard/`, config);
    },
}      
export default DASHBOARDAPI;
