import React, { useState, useEffect } from "react";
import { Box, Button, Divider, Grid, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import useLocales from "../../../hooks/useLocales";
import PageHeader from "../../../components/PageHeader";
import MandatoryTextField from "../../../pages/MandatoryTextField";
import EstimationAPI from "../../../services/EstimationService";
import { isValidResponse } from "../../../hooks/useAxiosPrivate";
import { axiosPrivate } from "../../../services/axios";

export default function RateCard() {
    const { translate } = useLocales();

    const [formData, setFormData] = useState({
        resourceType: "Employee",
        currencyType: "Non-USD",
        enteredAmount: "",
        dollerConversionRate: 0,
        overHeadPercentage: 0,
        nonBillableDays: 0,
        desiredGrossPercentage: 0,
        overHeadPercentageUSA: 0,
        nonBillableDaysUSA: 0,
        desiredGrossPercentageUSA: 0
    });

    const [minSellRate, setMinSellRate] = useState(50);
    const [minSellRateUSA, setMinSellRateUSA] = useState(50);
    const [viewText, setViewText] = useState("");
    const [payRateToolTipIND,setPayRateToolTipIND]=useState(0);
    const [payRateToolTipUSA,setPayRateToolTipUSA]=useState(0);

    const [calculatedValues, setCalculatedValues] = useState({
        usdSalary: 0,
        ctc: 0,
        hoursPerYear: 0,
        payRatePerHour: 0,
        sellRate: 0,
        weeklyCost: 0,
        weeklyPrice: 0,
        monthlyCost: 0,
        monthlyPrice: 0,
        quarterlyPrice: 0,
        yearlyPrice: 0,
        costRate: 0,
    });

    useEffect(() => {
        if (formData.resourceType === "Employee") {
            setFormData((prevData) => ({
                ...prevData,
                currencyType: "Non-USD",
            }));
            setViewText("");
        } else if (formData.resourceType === "Contractor") {
            setFormData((prevData) => ({
                ...prevData,
                currencyType: "USD",
            }));
            setViewText("");
        }
    }, [formData.resourceType]);

    async function getPayRate() {
        try {
            const response = await EstimationAPI.GETESTPAYRATE(axiosPrivate);
            if (isValidResponse(response)) {
                setFormData(prevData => ({
                    ...prevData,
                    dollerConversionRate: response?.data?.results[0]?.dollar_conversion_rate,
                    overHeadPercentage: response?.data?.results[0]?.overhead_percentage,
                    nonBillableDays: response?.data?.results[0]?.non_billable_days_per_year,
                    desiredGrossPercentage: response?.data?.results[0]?.desired_gross_margin_percentage,
                    overHeadPercentageUSA: response?.data?.results[0]?.overhead_percentage_usa,
                    nonBillableDaysUSA: response?.data?.results[0]?.non_billable_days_per_year_usa,
                    desiredGrossPercentageUSA: response?.data?.results[0]?.desired_gross_margin_percentage_usa
                }));
            }
        } catch (error) {
            console.log("Error while getting data", error);
        }
    }

    useEffect(() => {
        getPayRate();
    }, []);

    const handleResourceTypeChange = (event) => {
        setCalculatedValues({
            usdSalary: 0,
            ctc: 0,
            hoursPerYear: 0,
            payRatePerHour: 0,
            sellRate: 0,
            weeklyCost: 0,
            weeklyPrice: 0,
            monthlyCost: 0,
            monthlyPrice: 0,
            quarterlyPrice: 0,
            yearlyPrice: 0,
            costRate: 0,
        });
        setFormData(prevData => ({
            ...prevData,
            resourceType: event.target.value,
            enteredAmount: ""
        }));
    };

    const onAmountAdded = (e) => {
        const value = e.target.value;
        if (value === "") {
            setViewText("");
        }
        if (value === "" || parseFloat(value) > 0) {
            setFormData(prevData => ({
                ...prevData,
                enteredAmount: value
            }));
        }
    };

    const calculateValues = () => {
        const salaryInINR = parseFloat(formData.enteredAmount);
        if (isNaN(salaryInINR) || salaryInINR <= 0) return;

        const dollarConversion = formData.dollerConversionRate;
        const overhead = formData.overHeadPercentage;
        const nonBillable = formData.nonBillableDays;
        const gmPercentage = formData.desiredGrossPercentage;

        const usdSalary = salaryInINR / dollarConversion;
        const ctc = usdSalary + (usdSalary * overhead) / 100;
        const hoursPerYear = (52 * 40) - (nonBillable * 8);
        const payRatePerHour = ctc / hoursPerYear;
        setPayRateToolTipIND(payRatePerHour);
        let sellRate = payRatePerHour / (1 - (gmPercentage / 100));
        if (sellRate < minSellRate) {
            sellRate = minSellRate;
            setViewText("System Applies Minimum Sell Rate for Calculation.");
        } else {
            setViewText("");
        }
        const weeklyCost = payRatePerHour * 40;
        const weeklyPrice = sellRate * 40;
        const monthlyCost = payRatePerHour * hoursPerYear / 12;
        const monthlyPrice = sellRate * hoursPerYear / 12;
        const quarterlyPrice = sellRate * hoursPerYear / 4;
        const yearlyPrice = sellRate * hoursPerYear;

        setCalculatedValues({
            usdSalary,
            ctc,
            hoursPerYear,
            payRatePerHour,
            sellRate,
            weeklyCost,
            weeklyPrice,
            monthlyCost,
            monthlyPrice,
            quarterlyPrice,
            yearlyPrice
        });
    };

    const calculateValuesCnt = () => {
        const payRatePerHour = parseFloat(formData.enteredAmount);
        setPayRateToolTipUSA(payRatePerHour);
        if (isNaN(payRatePerHour) || payRatePerHour <= 0) return;

        const nonBillable = formData.nonBillableDaysUSA;
        const gmPercentage = formData.desiredGrossPercentageUSA;
        const overheadPercentageUsa = formData.overHeadPercentageUSA;

        const hoursPerYear = (52 * 40) - (nonBillable * 8);
        const costRate = payRatePerHour + (payRatePerHour * (overheadPercentageUsa / 100));
        let sellRate = costRate / (1 - (gmPercentage / 100));
        if (sellRate < minSellRateUSA) {
            sellRate = minSellRateUSA;
            setViewText("System Applies Minimum Sell Rate for Calculation.");
        } else {
            setViewText("");
        }
        const weeklyCost = payRatePerHour * 40;
        const weeklyPrice = sellRate * 40;
        const monthlyCost = payRatePerHour * hoursPerYear / 12;
        const monthlyPrice = sellRate * hoursPerYear / 12;
        const quarterlyPrice = sellRate * hoursPerYear / 4;
        const yearlyPrice = sellRate * hoursPerYear;

        setCalculatedValues({
            payRatePerHour,
            sellRate,
            weeklyCost,
            weeklyPrice,
            monthlyCost,
            monthlyPrice,
            quarterlyPrice,
            yearlyPrice,
            costRate
        });
    };

    useEffect(() => {
        if (formData.enteredAmount === "" || parseFloat(formData.enteredAmount) <= 0) {
            setCalculatedValues({
                usdSalary: 0,
                ctc: 0,
                hoursPerYear: 0,
                payRatePerHour: 0,
                sellRate: 0,
                weeklyCost: 0,
                weeklyPrice: 0,
                monthlyCost: 0,
                monthlyPrice: 0,
                quarterlyPrice: 0,
                yearlyPrice: 0,
                costRate: 0,
            });
        } else {
            if (formData.resourceType === "Employee") {
                calculateValues();
            } else {
                calculateValuesCnt();
            }
        }
    }, [formData.enteredAmount, formData.resourceType]);

    return (
        <>
            <PageHeader
                primaryTitle={translate("rateCard")}
                showBack={false}
                showSecondaryTitle={false}
            />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    height: "70vh",
                }}
            >
                {/* Form Section */}
                <Box
                    sx={{
                        flex: { xs: "1 1 100%", md: "0 0 33%" },
                        backgroundColor: "white",
                        borderRadius: 2,
                        padding: 3,
                        margin: "0 auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={12}>
                            <TextField
                                select
                                fullWidth
                                label={<MandatoryTextField label={translate("Select Type")} />}
                                value={formData.resourceType}
                                onChange={handleResourceTypeChange}
                            >
                                {PERSON_TYPE.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={12}>
                            <TextField
                                select
                                fullWidth
                                label={<MandatoryTextField label={translate("Currency")} />}
                                value={formData.currencyType}
                                disabled={true}
                            >
                                {CURRENCY_TYPE.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={12}>
                            <TextField
                                fullWidth
                                label={
                                    <MandatoryTextField
                                        label={
                                            formData.resourceType === "Employee"
                                                ? translate("Enter Salary(INR)")
                                                : translate("Enter Payrate/hr")
                                        }
                                    />
                                }
                                value={formData.enteredAmount}
                                onChange={onAmountAdded}
                                inputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                }}
                                type="number"
                            />
                        </Grid>
                    </Grid>

                </Box>

                {/* Results Section */}
                <Box
                    sx={{
                        flex: { xs: "1 1 100%", md: "0 0 62%" },
                        backgroundColor: "#f8f6f0",
                        borderRadius: 2,
                        padding: 3,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    <Typography color={"red"} >{viewText}</Typography>
                    {formData.resourceType === "Employee" ? (
                        <Box>
                            <Typography sx={{ color: "grey", fontSize: "small" }}>
                                Sell Rate
                            </Typography>
                            <Typography variant="h3">
                                <Tooltip
                                    title={
                                        <React.Fragment>
                                            <span>
                                                System default GM : Sell Rate: ${calculatedValues.sellRate.toFixed(2)} <br />
                                                Gross Margin 20% : Sell Rate : ${(payRateToolTipIND / (1 - (20 / 100))).toFixed(2)} <br />
                                                Gross Margin 10% : Sell Rate : ${(payRateToolTipIND / (1 - (10 / 100))).toFixed(2)} <br />
                                                Gross Margin 0% : Sell Rate : ${(payRateToolTipIND / (1 - (0 / 100))).toFixed(2)} <br />
                                            </span>
                                        </React.Fragment>
                                    }
                                >
                                    ${calculatedValues.sellRate.toFixed(2)}
                                </Tooltip>
                            </Typography>
                            <Divider orientation="horizontal" />
                            <Grid container spacing={3} py={1}>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Salary
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.usdSalary.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        CTC
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.ctc.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Pay Rate per Hour
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.payRatePerHour.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider orientation="horizontal" />
                            <Grid container spacing={3} py={1}>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Weekly Cost
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.weeklyCost.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Weekly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.weeklyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Monthly Cost
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.monthlyCost.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider orientation="horizontal" />
                            <Grid container spacing={3} py={1}>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Monthly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.monthlyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4} py={1}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Quarterly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.quarterlyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Yearly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.yearlyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box>
                            <Typography sx={{ color: "grey", fontSize: "small" }}>
                                Sell Rate
                            </Typography>
                            <Typography variant="h3">
                            <Tooltip
                                    title={
                                        <React.Fragment>
                                            <span>
                                                System default GM : Sell Rate: ${calculatedValues.sellRate.toFixed(2)} <br />
                                                Gross Margin 20% : Sell Rate : ${(payRateToolTipUSA / (1 - (20 / 100))).toFixed(2)} <br />
                                                Gross Margin 10% : Sell Rate : ${(payRateToolTipUSA / (1 - (10 / 100))).toFixed(2)} <br />
                                                Gross Margin 0% : Sell Rate : ${(payRateToolTipUSA / (1 - (0 / 100))).toFixed(2)} <br />
                                            </span>
                                        </React.Fragment>
                                    }
                                >
                                    ${calculatedValues.sellRate.toFixed(2)}
                                </Tooltip>
                            </Typography>
                            <Divider orientation="horizontal" />
                            <Grid container spacing={3} py={1}>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Pay Rate(/hr)
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.payRatePerHour.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Cost Rate
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues?.costRate?.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider orientation="horizontal" />
                            <Grid container spacing={3} py={1}>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Weekly Cost
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.weeklyCost.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Weekly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.weeklyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Monthly Cost
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.monthlyCost.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider orientation="horizontal" />
                            <Grid container spacing={3} py={1}>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Monthly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.monthlyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Quarterly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.quarterlyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ color: "grey", fontSize: "small" }}>
                                        Yearly Price
                                    </Typography>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        ${calculatedValues.yearlyPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Box>
        </>

    );
}

const PERSON_TYPE = ["Employee", "Contractor"];
const CURRENCY_TYPE = ["USD", "Non-USD"];