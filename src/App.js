import { BrowserRouter as Router, Route,Switch} from "react-router-dom";
import './App.css';
import 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminPanel from './components/Admin/AdminPanel';
import SignIn from './components/SignIn';
import InstantLogOut from './components/Auth/InstantLogoutButton';
import { useAuth0 } from "@auth0/auth0-react";
import EditStudentLessons from './components/Admin/EditStudentLessons';
import EditStudentTakenLessons from './components/Admin/TakenLessons/EditStudentTakenLessons';
import MyLessons from './components/MyLessons'
import InvoiceStatusTable from './components/Admin/Invoicing/InvoiceStatusTable'
import InvoiceTable2 from './components/Admin/Invoicing/InvoiceTable2'
import PreInvoiceTable2 from './components/Admin/Invoicing/PreInvoiceTable2'
import PreInvoiceTable2Admin from './components/Admin/Invoicing/PreInvoiceTable2Admin'
import EmailPanel from './components/Admin/Emailing/EmailPanel';
import PaymentPanel from './components/Admin/Payments/PaymentPanel';
import InvoiceReport from './components/Admin/Invoicing/InvoiceReport';
import MonthlyReport from './components/Admin/Reports/MonthlyReport';
import StudentRecords from './components/Admin/Reports/StudentRecords';
import ParentRecords from './components/Admin/Reports/ParentRecords';
import AddNewStudents2 from './components/Admin/AddNewStudents2';
import AllTeachers from './components/Admin/Teachers/AllTeachers';
import NavBar from './components/NavBar';
import OmegaPanel from './components/Omega/OmegaPanel';
import HackRegister from './components/Omega/HackRegister';
import HackLesson from './components/Omega/HackLesson';
import Queries from './components/Omega/Queries';
import axios from 'axios'
import OldRegister from "./components/OldRegister";
import InvoiceDetails from "./components/Omega/InvoiceDetails";
import PreviewInvoiceData from "./components/Omega/PreviewInvoiceData";
import PreviewSingleInvoiceData from "./components/Omega/PreviewSingleInvoiceData";
// import { CallbackPage } from "../Auth0/callback-page";
import { Component, useState } from "react";
import { AuthenticationGuard } from "./Auth0/authentication-guard";
// import { AuthenticationGuard } from "./Auth0/authentication-guard";
// const request = require('request');
const REACT_APP_SERVER = process.env.REACT_APP_SERVER
const REACT_APP_AUTH_AUDIENCE = process.env.REACT_APP_AUTH_AUDIENCE
axios.defaults.baseURL = REACT_APP_SERVER
  function  App() {
  var { user,isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const [errorMessage, setErrorMessage] = useState("");
  
  var accessToken = null;
  var userId = null;
  var data = {isAuthenticated: isAuthenticated, id:1}
 if(user != null){
  var email = user.email
  
  console.log(user)
  if(false || !user.nickname?.isKappa)
  {
    //logout({returnTo: window.location.origin})
  }
  const domain = REACT_APP_AUTH_AUDIENCE;
  var accessToken =   getAccessTokenSilently({
    authorizationParams: {
      audience: `${domain}`,
      scope: "read:messages",
    },
  });

  Promise.resolve(accessToken).then(async (value)=>
  {
    var config = {headers:{Authorization:`Bearer  ${value}`}}
    data.config = config

    await axios.get('/api/teacher/email/'+email, config).then((response)=>
    {
      data.id = response.data?._id;

    })
  })
 

  }else{
   // console.log('I am NOT Authenticated')
   
  
  }
  return (
    <div className="App" style={{minHeight:'100%',width:'100%',position:'absolute'}} >
      <div className="nav-container">
        <NavBar isAuthenticated={isAuthenticated} id={userId} userId={user?.nickname.userId} token={user?.nickname.token} role={user?.nickname.role}/>  
      </div>
      {
        errorMessage.length > 0?
          <div className="alert alert-danger ml-5 mr-5 mt-1 mb-1 d-flex" role="alert">
            <span>{errorMessage}</span> <span className="ml-auto mr-3 btn" onClick={(e)=> setErrorMessage("")} >&times;</span>
          </div>
        :null
      }
     
      <div >     
      

       <Router>
    <div >
      <Switch>
    
        <Route exact path='/logout' render={() =>(<InstantLogOut  />)}/>       
        <Route exact path='/register' render={() => (<AuthenticationGuard component={OldRegister} data={data} isAuthenticated={isAuthenticated} />)}/>
        <Route exact path='/my-lessons' render={() => (<AuthenticationGuard component={MyLessons} data={data} isAuthenticated={isAuthenticated} />)}/> 
        <Route exact path='/Omega' render={() => (<AuthenticationGuard component={OmegaPanel} data={data} isAuthenticated={isAuthenticated} />)}/>   
        <Route exact path='/admin/student-records' render={() => (<AuthenticationGuard component={StudentRecords} isAuthenticated={isAuthenticated} data={data} />)}/>
        
        
        <Route exact path='/admin/invoice-report' render={() => (isAuthenticated?<InvoiceReport id={1} userId={user.nickname.userId} role={user.nickname.role}  />:null)}/> 
        <Route exact path='/Admin/edit-student-lessons' render={() => (isAuthenticated && user.nickname.role >0?<EditStudentLessons id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token} setErrorMessage={setErrorMessage}  />:null)}/> 
        <Route exact path='/Admin/modify-taken-lessons' render={() => (isAuthenticated && user.nickname.role >0?<EditStudentTakenLessons id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/Admin' render={() => (isAuthenticated?<AdminPanel id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
             
        <Route exact path='/' render={() => (<SignIn user={user} setErrorMessage={setErrorMessage} />)}/> 
        
        <Route exact path='/admin/invoice-status-table' render={() => (isAuthenticated && user.nickname.role > 0?<InvoiceStatusTable id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/admin/email-panel' render={() => (isAuthenticated && user.nickname.role === 2?<EmailPanel id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/admin/payment-panel' render={() => (isAuthenticated && user.nickname.role > 0?<PaymentPanel id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/admin/monthly-report' render={() => (isAuthenticated && user.nickname.role === 2?<MonthlyReport id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        
        <Route exact path='/admin/parent-records' render={() => (isAuthenticated && user.nickname.role > 0?<ParentRecords id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/>
        <Route exact path='/admin/add-new-students-2' render={() => (<AddNewStudents2    />)}/> 
        <Route exact path='/admin/invoice-table-2' render={() => (isAuthenticated && user.nickname.role === 2?<InvoiceTable2 id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/admin/pre-invoice' render={() => (isAuthenticated && user.nickname.role === 2?<PreInvoiceTable2 id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/admin/admin-pre-invoice' render={() => (isAuthenticated && user.nickname.role > 0?<PreInvoiceTable2Admin id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/>
        <Route exact path='/admin/all-teachers' render={() => (isAuthenticated && user.nickname.role === 2?<AllTeachers id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/omega/hack-register' render={() => (isAuthenticated && user.nickname.role === 2?<HackRegister id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/omega/hack-lessons' render={() => (isAuthenticated && user.nickname.role === 2?<HackLesson id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/omega/invoice-details' render={() => (isAuthenticated && user.nickname.role === 2?<InvoiceDetails id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/omega/queries' render={() => (isAuthenticated && user.nickname.role === 2?<Queries id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/omega/preview-invoice' render={() => (isAuthenticated && user.nickname.role === 2?<PreviewInvoiceData id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 
        <Route exact path='/omega/preview-single-invoice' render={() => (isAuthenticated && user.nickname.role === 2?<PreviewSingleInvoiceData id={user.nickname._id} userId={user.nickname.userId} token={user.nickname.token}   />:null)}/> 

      </Switch>

    </div>
    </Router>
    </div>
    <script src="https://apis.google.com/js/platform.js" async defer></script>

    
<script src="https://code.jquery.com/jquery-1.12.3.min.js"></script>


<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/0.9.0rc1/jspdf.min.js"></script>

   
   
    </div>
  );
}

export default App;
