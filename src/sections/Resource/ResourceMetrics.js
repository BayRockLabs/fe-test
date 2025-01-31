import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import { Box, Grid } from "@mui/material";
import ResourceMatricsAPI from "../../services/ResourceMatricsService";
import BasicTable from "./ResourceMetricsTable";
import { axiosPrivate } from "../../services/axios";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import { anchorOrigin } from "../../utils/constants";
import { useSnackbar } from "notistack";


export default function ResourceMetricsScreen() {
    const { translate } = useLocales();
    const [emplyeeRole, setEmployeeRole] = useState([]);
    const [emplyeeSkill, setEmployeeSkill] = useState([]);
    const [emplyeeCountry, setEmployeeCountry] = useState([]);
    const tableType = ["Role", "Skill", "Country"];
    const [isRoleDataLoading, setIsRoleDataLoading] = useState(true);
    const [isSkillDataLoading, setIsSkillDataLoading] = useState(true);
    const [isCountryDataLoading, setIsCountryDataLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchEmployeeRoleListData();
        fetchEmployeeSkillListData();
        fetchEmployeeCountryTypeListData();
    }, []);

    const onError = (message) => {
        enqueueSnackbar("Listing - " + message, {
            anchorOrigin,
            variant: "error",
        });
    };

    const fetchEmployeeRoleListData = async () => {
        try {
            const response = await ResourceMatricsAPI.EmployeeRoleList(axiosPrivate);
            if (isValidResponse(response)) {
                console.log(response?.data);
                setEmployeeRole(response?.data);
            } else {
                setEmployeeRole([]);
                onError(translate("error.fetch"));
            }
        } catch (error) {
            console.log("Error in fetchListFromAPI ", error);
            onError(translate("error.fetch"));

        }
        setIsRoleDataLoading(false);
    };

    const fetchEmployeeSkillListData = async () => {
        try {
            const response = await ResourceMatricsAPI.EmployeeSkillList(axiosPrivate);
            if (isValidResponse(response)) {
                setEmployeeSkill(response?.data);
                setIsSkillDataLoading(false);
            } else {
                setEmployeeSkill([]);
                onError(translate("error.fetch"));
            }
        } catch (error) {
            console.log("Error in fetchListFromAPI ", error);
            onError(translate("error.fetch"));
        }
        setIsSkillDataLoading(false);
    };

    const fetchEmployeeCountryTypeListData = async () => {
        try {
            const response = await ResourceMatricsAPI.EmployeeCountryTypeList(axiosPrivate);
            if (isValidResponse) {
                setEmployeeCountry(response?.data);
            } else {
                setEmployeeCountry([]);
                onError(translate("error.fetch"));
            }
        } catch (error) {
            console.log("Error in fetchListFromAPI ", error);
            onError(translate("error.fetch"));
        }
        setIsCountryDataLoading(false);

    };

    return <>
        <PageHeader
            primaryTitle={translate("Resource Metrics")}
            showSecondaryTitle={false}
        />
        <Box>
            <Grid
                container
                spacing={{ xs: 2, md: 3, lg: 3 }}
                columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <BasicTable dataList={emplyeeRole} tableType={tableType[0]} isLoading={isRoleDataLoading} />
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <BasicTable dataList={emplyeeSkill} tableType={tableType[1]} isLoading={isSkillDataLoading} />
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <BasicTable dataList={emplyeeCountry} tableType={tableType[2]} isLoading={isCountryDataLoading} />
                </Grid>
            </Grid>
        </Box>
    </>
}


