import * as React from "react";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import { Box, Grid, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, RadialBar, RadialBarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { axiosPrivate } from "../../services/axios";
import DASHBOARDAPI from "../../services/DashBoardService";
import { isValidResponse } from "../../hooks/useAxiosPrivate";

export default function DashBoardScreen() {
    const { translate } = useLocales();
    const [sowContractData, setSowContractData] = React.useState({});
    const [pOData, setPOData] = React.useState({});
    const [invoicesData, seInvoicesData] = React.useState({});
    const [allocationData, setAllocationData] = React.useState({});
    const [sowVsMilestone, setSowVsMilestone] = React.useState({});
    const [sowVsPo, setSowVsPO] = React.useState({});
    React.useEffect(() => {
        fetchData();
    }, [])
    async function fetchData() {
        try {
            const response = await DASHBOARDAPI.DATA(axiosPrivate);
            if (isValidResponse(response)) {
                setSowContractData(response?.data?.dashboard?.active_sows);
                setPOData(response?.data?.dashboard?.unutilized_purchase_orders);
                seInvoicesData(response?.data?.dashboard?.active_invoices);
                setAllocationData(response?.data?.dashboard?.pending_allocations);
                setSowVsMilestone(response?.data?.dashboard?.sow_vs_milestones_comparison);
                setSowVsPO(response?.data?.dashboard?.sow_po_status);
            }
        } catch (error) {
            console.log("error while fetching data", error);
        }
    }

    function formatCurrency(num) {
        const isNegative = num < 0;
        num = Math.abs(num);

        let suffix = '';
        let formattedNumber = num;

        if (num >= 1e12) {
            formattedNumber = (num / 1e12).toFixed(1);
            suffix = 'T';
        } else if (num >= 1e9) {
            formattedNumber = (num / 1e9).toFixed(1);
            suffix = 'B';
        } else if (num >= 1e6) {
            formattedNumber = (num / 1e6).toFixed(1);
            suffix = 'M';
        } else if (num >= 1e3) {
            formattedNumber = (num / 1e3).toFixed(1);
            suffix = 'K';
        }

        formattedNumber = formattedNumber.toString();

        if (formattedNumber.endsWith('.0')) {
            formattedNumber = formattedNumber.slice(0, -2);
        }

        const result = `$${formattedNumber}${suffix}`;

        return isNegative ? `-${result}` : result;
    }
    const ContractData = [
        {
            name: "SOW Contracts",
            sow: sowContractData?.active_sow_count,
            amt: sowVsMilestone?.total_active_sow_amount,
            total: sowVsMilestone?.total_active_sow_amount,
        },
    ];
    const POData = [
        {
            name: "Purchase Orders",
            po: pOData?.unutilized_po_count,
            amt: pOData?.total_unutilized_po_amount,
            total: pOData?.total_unutilized_po_amount,
        },
    ];


    const invoiceData = [
        {
            name: "Invoices",
            invoice: invoicesData?.active_invoice_count,
            amt: invoicesData?.total_active_invoice_amount,
            total: invoicesData?.total_active_invoice_amount,
        },

    ];

    const donutData1 = [
        { name: 'Section A', value: sowVsMilestone?.total_active_sow_amount },
        { name: 'Section B', value: sowVsMilestone?.total_milestone_amount },

    ];

    const donutData2 = [
        { name: 'Section A', value: sowVsPo?.total_sow_count },
        { name: 'Section B', value: sowVsPo?.sows_with_po_attached },
        { name: 'Section c', value: sowVsPo?.sows_with_po_pending },
    ];

    const COLORS1 = ['#16aac6', '#13c151'];
    const COLORS2 = ['#15bbc4', '#953cf1', '#ff322b'];


    return (
        <>
            <Box>
                <Box sx={{ marginLeft: "1rem" }}>
                    <PageHeader
                        primaryTitle={translate("Insights")}
                        showSecondaryTitle={false}
                    />
                </Box>
                <Box>
                    <Grid container
                        spacing={{ xs: 1, md: 1, lg: 1 }}
                        columns={{ xs: 6, sm: 6, md: 6, lg: 12 }}
                    >
                        <Grid item xs={6} sm={6} md={4} lg={4}>
                            <Box sx={{ margin: 1, height: 200, backgroundColor: 'white', position: 'relative' }}>
                                <Typography sx={{ padding: 1 }} variant="subtitle2">SOW Contracts</Typography>
                                <BarChart
                                    width={300}
                                    height={100}
                                    data={ContractData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 30,
                                        bottom: 5
                                    }}
                                >
                                    <Bar yAxisId="left" dataKey="sow" fill="#6670e0" />
                                    <Bar yAxisId="right" dataKey="amt" fill="#2e36d3" />
                                </BarChart>
                                <Box sx={{marginLeft:"30px"}}>
                                    <Box sx={{display:"flex",alignItems: "center"}}>
                                        <Box sx={{height:"15px",width:"15px",backgroundColor:"#6670e0",marginRight:"5px"}}></Box>
                                        <Typography>Active SOW Contracts - {sowContractData?.active_sow_count}</Typography>
                                    </Box>
                                    <Box sx={{display:"flex",alignItems: "center"}}>
                                        <Box sx={{height:"15px",width:"15px",backgroundColor:"#2e36d3",marginRight:"5px"}}></Box>
                                        <Typography>Total SOW Amount - {formatCurrency(sowVsMilestone?.total_active_sow_amount)}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={4}>
                            <Box sx={{ margin: 1, height: 200, backgroundColor: 'white', position: 'relative' }}>
                                <Typography sx={{ padding: 1 }} variant="subtitle2">Purchase Orders</Typography>                               
                                <BarChart
                                    width={300}
                                    height={100}
                                    data={POData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 30,
                                        bottom: 5
                                    }}
                                >
                                    <Bar yAxisId="left" dataKey="po" fill="#8f53de" />
                                    <Bar yAxisId="right" dataKey="amt" fill="#4b31b6" />
                                </BarChart>
                                <Box sx={{marginLeft:"30px"}}>
                                    <Box sx={{display:"flex",alignItems: "center"}}>
                                        <Box sx={{height:"15px",width:"15px",backgroundColor:"#8f53de",marginRight:"5px"}}></Box>
                                        <Typography>Unutilize Purchase Orders - {pOData?.unutilized_po_count}</Typography>
                                    </Box>
                                    <Box sx={{display:"flex", alignItems:"center"}}>
                                        <Box sx={{height:"15px",width:"15px",backgroundColor:"#4b31b6",marginRight:"5px"}}></Box>
                                        <Typography>Unutilize PO Amount - {formatCurrency(pOData?.total_unutilized_po_amount)}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={4}>
                            <Box sx={{ margin: 1, height: 200, backgroundColor: 'white', position: 'relative' }}>
                                <Typography sx={{ padding: 1 }} variant="subtitle2">Invoices</Typography>
                                <BarChart
                                    width={300}
                                    height={100}
                                    data={invoiceData}
                                    margin={{
                                        top: 15,
                                        right: 30,
                                        left: 30,
                                        bottom: 5
                                    }}
                                >
                                    <Bar yAxisId="left" dataKey="invoice" fill="#69bad5" />
                                    <Bar yAxisId="right" dataKey="amt" fill="#039fd3" />
                                </BarChart>
                                <Box sx={{marginLeft:"30px"}}>
                                    <Box sx={{display:"flex",alignItems: "center"}}>
                                        <Box sx={{height:"15px",width:"15px",backgroundColor:"#69bad5",marginRight:"5px"}}></Box>
                                        <Typography>Active Invoices - {invoicesData?.active_invoice_count}</Typography>
                                    </Box>
                                    <Box sx={{display:"flex",alignItems: "center"}}>
                                        <Box sx={{height:"15px",width:"15px",backgroundColor:"#039fd3",marginRight:"5px"}}></Box>
                                        <Typography>Invoices Amount - {formatCurrency(invoicesData?.total_active_invoice_amount)}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>                  
                    </Grid>
                </Box>
                <Box>
                    <Grid container
                        spacing={{ xs: 1, md: 1, lg: 1 }}
                        columns={{ xs: 6, sm: 6, md: 12, lg: 12 }}
                    >
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Box sx={{ margin: 1, height: 210, backgroundColor: 'white' }}>
                                <Typography sx={{ padding: 1 }} variant="subtitle2">SOW vs Milestones</Typography>
                                <ResponsiveContainer style={{ display: "flex" }} width="100%" height="70%">
                                    <PieChart>
                                        <Pie
                                            data={donutData1}
                                            innerRadius={95}
                                            outerRadius={145}
                                            fill="#8884d8"
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {donutData1.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS1[index % COLORS1.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box sx={{ width: '10px', height: '10px', backgroundColor: '#16aac6', marginRight: 1 }} />
                                            <Typography sx={{ fontSize: '0.8rem' }}>SOW Amount: </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: "bold" }}>{formatCurrency(sowVsMilestone?.total_active_sow_amount)}</Typography>

                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box sx={{ width: '10px', height: '10px', backgroundColor: '#13c151', marginRight: 1 }} />
                                            <Typography sx={{ fontSize: '0.8rem' }}>Milestones Amount: </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: "bold" }}>{formatCurrency(sowVsMilestone?.total_milestone_amount)}</Typography>
                                        </Box>
                                    </Box>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Box sx={{ margin: 1, height: 210, backgroundColor: 'white', }}>
                                <Typography sx={{ padding: 1 }} variant="subtitle2" >SOW vs Purchase Order</Typography>
                                <ResponsiveContainer style={{ display: "flex" }} width="100%" height="70%">
                                    <PieChart>
                                        <Pie
                                            data={donutData2}
                                            innerRadius={95}
                                            outerRadius={145}
                                            fill="#8884d8"
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {donutData2.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box sx={{ width: '10px', height: '10px', backgroundColor: '#15bbc4', marginRight: 1 }} />
                                            <Typography sx={{ fontSize: '0.8rem' }}>SOW Created: </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: "bold" }}>{sowVsPo?.total_sow_count}</Typography>

                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box sx={{ width: '10px', height: '10px', backgroundColor: '#953cf1', marginRight: 1 }} />
                                            <Typography sx={{ fontSize: '0.8rem' }}>PO Attached: </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: "bold" }}>{sowVsPo?.sows_with_po_attached}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box sx={{ width: '10px', height: '10px', backgroundColor: '#ff322b', marginRight: 1 }} />
                                            <Typography sx={{ fontSize: '0.8rem' }}>PO Pending: </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: "bold" }}>{sowVsPo?.sows_with_po_pending}</Typography>
                                        </Box>
                                    </Box>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    )
}