import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from "../abis/Calend3.json"
import Paper from "@mui/material/Paper";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentForm,
} from "@devexpress/dx-react-scheduler-material-ui";

const schedulerData = [
  {
    startDate: "2022-06-01T09:45",
    endDate: "2022-06-01T11:00",
    title: "Meeting",
  },
  {
    startDate: "2022-06-01T12:00",
    endDate: "2022-06-01T13:30",
    title: "Go to a gym",
  },
];

const contractAddress = "0x4b494eB5568571254760e5006e7D0239e375871E";
const contractABI = abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);

const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());  

const Calendar = ({ account }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [rate, setRate] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const [showDialog, setShowDialog] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [mined, setMined] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  const getData = async () => {
    // get contract owner and set admin if connected account is owner
    const owner = await contract.getOwner();
    setIsAdmin(owner.toUpperCase() === account.toUpperCase());
    const rate = await contract.getRate();
    setRate(ethers.utils.formatEther(rate.toString()));

    const appointmentData = await contract.getAppointments();

    console.log('appointments', appointmentData)
    console.log('rate:', rate.toString());

    transformAppointmentData(appointmentData);
  } 

  const transformAppointmentData = (appointmentData) => {
    let data = [];
    appointmentData.forEach(appointment => {
      data.push({
        title: appointment.title,
        startDate: new Date(appointment.startTime * 1000),
        endDate: new Date(appointment.endTime * 1000),
      });
    });

    setAppointments(data);
}

  useEffect(() => {
    getData();
  },[])

  const saveAppointment = async (data) => {
    console.log('committing changes');
    console.log(data);

    const appointment = data.added;
    const title = appointment.title;
    const startTime = appointment.startDate.getTime() / 1000;
    const endTime = appointment.endDate.getTime() / 1000;

    setShowSign(true);
    setShowDialog(true);
    setMined(false);

    try {
        const cost = ((endTime - startTime) / 60) * (rate * 100) / 100;
        const msg = {value: ethers.utils.parseEther(cost.toString())};
        let transaction = await contract.createAppointment(title, startTime, endTime, msg);
        
        setShowSign(false);

        await transaction.wait();

        setMined(true);
        setTransactionHash(transaction.hash);
    } catch (error) {
        console.log(error);
    }
  }

  const saveRate = async () => {
    const tx = await contract.setRate(ethers.utils.parseEther(rate.toString()));
  }

  const handleSliderChange = (event, newValue) => {
    setRate(newValue);
  }

  const marks = [
    {
      value: 0.00,
      label: 'Free',
    },
    {
      value: 0.02,
      label: '0.02 ETH/min',
    },
    {
      value: 0.04,
      label: '0.04 ETH/min',
    },
    {
        value: 0.06,
        label: '0.06 ETH/min',
    },
    {
        value: 0.08,
        label: '0.08 ETH/min',
    },
    {
      value: 0.1,
      label: 'Expensive',
    },
  ];

  const ConfirmDialog = () => {
    return <Dialog open={true}>
        <h3 style={{textAlign: 'center', padding: '0px 20px 20px 20px'}}>
          {mined && 'Appointment Confirmed'}
          {!mined && !showSign && 'Confirming Your Appointment...'}
          {!mined && showSign && 'Please Sign to Confirm'}
        </h3>
        <div style={{textAlign: 'left', padding: '0px 20px 20px 20px'}}>
            {mined && <div>
              Your appointment has been confirmed and is on the blockchain.<br /><br />
              <a target="_blank" rel="noreferrer" href={`https://goerli.etherscan.io/tx/${transactionHash}`}>View on Etherscan</a>
              </div>}
          {!mined && !showSign && <div><p>Please wait while we confirm your appoinment on the blockchain....</p></div>}
          {!mined && showSign && <div><p>Please sign the transaction to confirm your appointment.</p></div>}
        </div>
        <div style={{textAlign: 'center', paddingBottom: '30px'}}>
        {!mined && <CircularProgress />}
        </div>
        {mined && 
        <Button onClick={() => {
            setShowDialog(false);
            getData();
          }
          }>Close</Button>}
      </Dialog>
    }

  const Admin = () => {
    return <div id="admin">
        <Box>
            <h3>Set Your Minutely Rate</h3>
            <Slider defaultValue={rate ? parseFloat(rate) : 0.01} 
                id="white"
                step={0.0001} 
                min={0}
                marks={marks}
                max={.01} 
                valueLabelDisplay="auto"
                onChangeCommitted={handleSliderChange} />
            <br /><br />
            <Button onClick={saveRate} variant="contained"><SettingsSuggestIcon className='icon'/>save rate</Button>
        </Box>
    </div>
  }

  return (
    <div>
    {
      isAdmin && (<Admin />)
    }
    <Paper>
      <Scheduler data={appointments}>
        <ViewState />
        <EditingState onCommitChanges={saveAppointment} />
        <IntegratedEditing />
        <WeekView startDayHour={9} endDayHour={19} />
        <Appointments />
        <AppointmentForm />
      </Scheduler>
    </Paper>
    { showDialog && <ConfirmDialog /> }
    </div>
  );
};

export default Calendar;
