import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box } from "@mui/material";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import OutlinedInput from '@mui/material/OutlinedInput';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
// import data from '../pages/data.json';
import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import ResourceAPI from "../services/ResourceService";

import Button from '@mui/material/Button';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../routes/paths";
// import Select from "react-select";
import { displayError } from "../utils/handleErrors";
import { useSnackbar } from "notistack";
import { anchorOrigin } from '../utils/constants';

function Form({ onValChange, formObject, onFormSubmit, handleClose }) {
    const [value, setValue] = React.useState(dayjs('2022-04-07'));

    const experiences = [
        { id: "1", name: "Advanced" },
        { id: "2", name: "Intermediate" },
        { id: "2", name: "Basic" }

    ];

    const regions = [
        { id: 1, ExperienceId: "1", name: "India" },
        { id: 2, ExperienceId: "1", name: "USA" },
        { id: 3, ExperienceId: "2", name: "Canada" },
        { id: 4, ExperienceId: "2", name: "UK" }
    ]

    const payrates = [
        { id: 1, RegionId: "1", name: "INR" },
        { id: 2, RegionId: "1", name: "USD" },
        { id: 3, RegionId: "2", name: "BTC" },
        { id: 4, RegionId: "2", name: "EUR" },
        { id: 5, RegionId: "3", name: "DOLLARS" },

    ]
    const axiosPrivate = useAxiosPrivate();
    const { enqueueSnackbar } = useSnackbar();

    const [experience, setExperience] = useState([]);
    // const [region, setRegion] = useState([]);
    const [payrate, setPayrate] = useState([]);
    const [roletype, setRoletype] = useState([]);
    const [expertiselevel, setExpertiselevel] = useState([]);
    const [defaultpayrate, setDefaultpayrate] = useState([]);
    const [region, setRegion] = useState([]);
    const [exparr, setExparr] = useState([])
    // const [loadResList,setLoadResList] = useState([])


    useEffect(() => {
        setExperience(experiences);
    }, [])

    const handleExperience = (id, e) => {
        const dt = regions.filter(x => x.ExperienceId === id.toString());
        setRegion(dt);
        // console.log(dt, "Hi")
        onValChange(e)

    }

    const handleRegion = (id, e) => {
        const dt = payrates.filter(x => x.id === id);
        setPayrate(dt);
        onValChange(e)
        // console.log(dt, "soha")

    }

        const fetchResData = async () => {
            try {
                const response = await ResourceAPI.ResourceList(axiosPrivate);
                // setRoletype(response?.data);
                //console.log("data "+response.data)
                setExpertiselevel(response.data);
                // setExpertiselevel(response?.data);
                // setDefaultpayrate(response?.data)
                // setRegion(response?.data)
            } catch (error) {
                displayError(enqueueSnackbar, error, {anchorOrigin});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => {
            fetchResData();
          }, []);


          const fetch_expertise_levels = expertiselevel.reduce((index, role) => {
            //console.log("role "+role);
            console.log("Ïndex: "+index);
            return role  
          }, []
          ) 

          const flat_pay_rate = fetch_expertise_levels.pay_rate.reduce((index, rate)=>{
            console.log("Ïndex pay: "+index);
            return rate
          },[]
          )
        


    // const fetch_expertise_levels = expertiselevel.map((role) => role.pay_rate.map((rate) => rate.Expertise_Level));
    // const flattenedLevels = fetch_expertise_levels.flat();
    // roletype.map((each_role) => console.log("Role type : " + each_role.role_type))
    // expertiselevel.map((each_expereince) => console.log("expereince:" + each_expereince.pay_rate?.Expertise_Level))

    // expertiselevel.map((each_expereince.pay_rate.map(each_rate)=>console.log("expereince:"+each_rate.Expertise_Level)))

    // useEffect(()=>{
    //     if(expertiselevel){
    //     expertiselevel.length>0?expertiselevel.map((each_experience) =>{ 
    //         console.log(each_experience,"soha")
    //             setExparr(exparr.push({exp:each_experience.Expertise_Level}))

    //             })
    //     : setExparr((expertiselevel.Expertise_Level&&expertiselevel.Expertise_Level))
    //         }else{
    //             console.log('data not coming')
    //         }
    // },[expertiselevel,expertiselevel.length])
    // defaultpayrate.map((each_payrate) => console.log("Payrate :" + each_payrate.pay_rate?.default_pay_rate))
    // region.map((each_region) => console.log("region :" + each_region.pay_rate?.region))

    // const [country, setCountry] = useState(null);
    // const [lang, setLang] = useState(null);
    // const [langList, setLangList] = useState([]); 
    // const [link, setLink] = useState("");

    // // handle change event of the country dropdown
    // const handleCountryChange = (obj) => {
    //   setCountry(obj);
    //   setLangList(obj.languages);
    //   setLang(null);
    // };

    // // handle change event of the language dropdown
    // const handleLanguageChange = (obj) => {
    //   setLang(obj);
    // };

    // // generate the link when both dropdowns are selected
    // useEffect(() => {
    //   if (country && lang) {
    //     setLink(`https://www.${country.url}/search?q=Clue+Mediator&gl=${country.country_code}&hl=${lang.code}`);
    //   }
    // }, [country, lang]);
    // console.log(exparr, "Alien")
    
    return (

        <div>
            <>
                <Box sx={{ margin: '15px', fontFamily: 'Inter', fontSize: '24px', fontWeight: '700', lineHeight: '29px', color: '#102D58', height: '50px' }}>
                    <HighlightOffIcon onClick={handleClose} sx={{ height: '50px', width: '30px', margin: '10px' }} />
                    <span>Efforts Estimation</span>
                </Box>
                <Box sx={{ display: 'flex', gap: '30px', flexDirection: 'row', direction: 'revert', margin: '16px' }}>

                    <FormControl fullWidth sx={{ m: 2, borderRadius: '12px', width: '95%' }}>
                        <InputLabel htmlFor="outlined-adornment-estimationId">EstimationId</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-estimationId"
                            // startAdornment={<InputAdornment position="above">$</InputAdornment>}
                            label="Estimation Id"
                            size='medium'
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 2, borderRadius: '12px', width: '95%' }}>
                        <InputLabel htmlFor="outlined-adornment-clientId">ClientId</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-clientId"
                            // startAdornment={<InputAdornment position="above">$</InputAdornment>}
                            label="Client Id"
                            size='medium'
                        />
                    </FormControl>
                </Box>
                <Box sx={{ margin: '15px', fontFamily: 'Inter', fontSize: '20px', fontWeight: '700', lineHeight: '29px', color: '#102D58', height: '50px' }}>
                    <span>Add Resources</span>
                </Box>
                <Box sx={{ display: 'flex', gap: '30px', flexDirection: 'row', direction: 'revert', margin: '16px' }}>

                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Resource Role</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.resourceRole}
                            label="Resource role"
                            onChange={onValChange}
                            name="resourceRole"
                        >
                            {/* <MenuItem value="FullStack Developer">FullStack Developer</MenuItem>
                            <MenuItem value="Devops ENG">Devops ENG</MenuItem>
                            <MenuItem value="UI Designer">UI Designer</MenuItem>
                            <MenuItem value="cloud Architect">Cloud architect</MenuItem> */}
                            <MenuItem value="0">Select Role</MenuItem>
                            {
                                roletype &&
                                    roletype !== undefined ?
                                    roletype.map((each_role, index) => {
                                        return (
                                            <MenuItem key={index} value={each_role.role_type}>{each_role.role_type}</MenuItem>
                                        )
                                    })
                                    : "No resourceRole"

                            }

                        </Select>
                    </FormControl>


                    {/* <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Experience</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.experience}
                            label="Experience"
                            onChange={onValChange}
                            name="experience"
                        >
                            <MenuItem value="Basic">Basic</MenuItem>
                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                            <MenuItem value="Advance">Advance</MenuItem>
                        </Select>
                    </FormControl> */}
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Experience</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.experience}
                            label="Experience"
                            // onChange={onValChange}
                            onChange={(e) => handleExperience(e.target.value, e)}
                            name="experience"
                        >

                            <MenuItem value="0">Select Experience</MenuItem>
 
                             {flat_pay_rate.map((index, each_val) => (

                                 <MenuItem key={index} value={each_val.Expertise_Level}>{each_val.Expertise_Level}</MenuItem>

                             ))} 
                            {/* {
                                expertiselevel &&
                                    expertiselevel !== undefined ?
                                    expertiselevel.map((each_expereince, index) => {
                                        return (
                                            <MenuItem key={index} value={each_expereince.pay_rate?.Expertise_Level}>{each_expereince.pay_rate?.Expertise_Level}</MenuItem>
                                        )
                                        
                                    })
                                    : "No Experience"

                            } */}


                            {/* <MenuItem value="Basic">Basic</MenuItem>
                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                            <MenuItem value="Advance">Advance</MenuItem> */}
                        </Select>
                    </FormControl>

                    {/*                    
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Region</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.region}
                            label="Region"
                            onChange={onValChange}
                            name="region"
                            // disabled = {formObject.expereinece?false:true }
                        >
                            <MenuItem value="India">India</MenuItem>
                            <MenuItem value="USA">USA</MenuItem>
                            <MenuItem value="Canada">Canada</MenuItem>
                        </Select>
                    </FormControl> */}

                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Region</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.region}
                            label="Region"
                            // onChange={onValChange}
                            onChange={(e) => handleRegion(e.target.value, e)}
                            name="region"
                        // disabled = {formObject.expereinece?false:true }
                        >
                            {/* <MenuItem value=0>Select Region</MenuItem> */}
                            {/* {
                                region &&
                                    region !== undefined ?
                                    region.map((each_region,index) => {
                                        return (
                                            <MenuItem key={index} value={each_region.each_region.pay_rate?.region || ""}>{each_region.each_region.pay_rate?.region ||""}</MenuItem>
                                        )
                                    })
                                    : "No Region"

                            } */}
                            {/* <MenuItem value="India">India</MenuItem>
                            <MenuItem value="USA">USA</MenuItem>
                            <MenuItem value="Canada">Canada</MenuItem> */}
                        </Select>
                    </FormControl>



                    {/* 
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Pay Rate</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.payRate}
                            label="Pay Rate"
                            onChange={onValChange}
                            name="payRate"
                        >
                            <MenuItem value={10}>USD</MenuItem>
                            <MenuItem value={20}>EUR</MenuItem>
                            <MenuItem value={30}>BTC</MenuItem>
                        </Select>
                    </FormControl> */}
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Pay Rate</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={formObject.payRate}
                            label="Pay Rate"
                            onChange={(e) => onValChange(e)}
                            name="payRate"
                        >
                            {/* <MenuItem value="0">Select Payrate</MenuItem> */}
                            {/* {
                                defaultpayrate &&
                                    defaultpayrate !== undefined ?
                                    defaultpayrate.map((each_payrate, index) => {
                                        return (
                                            <MenuItem key={index} value={each_payrate.pay_rate?.default_pay_rate}>{each_payrate.pay_rate?.default_pay_rate}</MenuItem>
                                        )
                                    })
                                    : "No Region"

                            } */}
                            {/* <MenuItem value={10}>USD</MenuItem>
                            <MenuItem value={20}>EUR</MenuItem>
                            <MenuItem value={30}>BTC</MenuItem> */}
                        </Select>
                    </FormControl>


                    <FormControl fullWidth>
                        <InputLabel htmlFor="outlined-adornment-Address">Bill Allocation</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-Address"
                            // startAdornment={<InputAdornment position="start">$</InputAdornment>}
                            label="Bill Allocation"
                            value={formObject.billAllocation}
                            onChange={onValChange}
                            name="billAllocation"
                        />
                    </FormControl>

                    <DatePicker
                        openTo="year"
                        views={['year', 'month', 'day']}
                        label="Start Date"
                        value={formObject.startDate}
                        // onChange={onDateChange}
                        onChange={(value) => {
                            // onStartDateChange(e);
                            onValChange({ target: { name: "startDate", value } })


                        }}

                        renderInput={(params) => <TextField {...params} helperText={null} sx={{ width: '100%' }} />}
                    />

                    <DatePicker
                        openTo="year"
                        views={['year', 'month', 'day']}
                        label="End Date"
                        value={formObject.endDate}

                        onChange={(value) => {
                            // onEndDateChange(e);
                            onValChange({ target: { name: "endDate", value } })

                        }}
                        renderInput={(params) => <TextField {...params} helperText={null} sx={{ width: '100%' }}
                        />}
                    />

                </Box>


                <Button onClick={onFormSubmit}
                    sx={{ float: 'right', backgroundColor: '#2F7FF6', color: 'white', margin: '30px', borderRadius: '12px', width: '150px', height: '40px' }}
                >
                    
                    
                </Button>

            </>
        </div >

    )
}
export default Form;
