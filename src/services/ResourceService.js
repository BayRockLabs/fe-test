const ResourceAPI = {
  ResourceList: (axiosPrivate) => {
    return axiosPrivate.get("/role-skill-mapping");
  },
};

export default ResourceAPI;
